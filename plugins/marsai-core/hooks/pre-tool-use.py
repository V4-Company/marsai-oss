#!/usr/bin/env python3
"""Guard direct Git commit/PR commands and keep history linear.

Two responsibilities:
  1. Route `git commit` and `gh pr create` through the MarsAI skills. The skills
     run the command with a marker in front of it (MARSAI_COMMIT_SKILL=1,
     MARSAI_PR_SKILL=1); a command without the marker is denied. In PowerShell,
     where Codex runs commands on Windows, the marker is an earlier statement:
     `$env:MARSAI_COMMIT_SKILL=1; git commit ...`.
  2. Prevent merge commits: the flow integrates by rebase and fast-forward.
     Set MARSAI_LINEAR_HISTORY=off to switch this rule off in a repository
     that merges.
"""
import json
import os
import re
import shlex
import subprocess
import sys
from typing import Callable, List, Optional, Tuple

# git global options that consume the following token as their value.
_GLOBAL_OPTS_WITH_VALUE = {
    "-C",
    "-c",
    "--git-dir",
    "--work-tree",
    "--namespace",
    "--super-prefix",
    "--exec-path",
}

_LINEAR_HISTORY_HINT = (
    "This flow keeps history linear (rebase and fast-forward, no merge commits). "
    "Set MARSAI_LINEAR_HISTORY=off if this repository merges."
)


def _deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def _split_segments(command: str) -> List[str]:
    """Split on `;`, `&&`, `||`, `|`, `&` and newlines that sit outside quotes.

    Quote-aware, so a commit message such as "fix; git merge b" stays one piece.
    """
    segments: List[str] = []
    current: List[str] = []
    quote: Optional[str] = None
    i = 0
    while i < len(command):
        char = command[i]
        if quote:
            if char == "\\" and quote == '"' and i + 1 < len(command):
                current.append(command[i:i + 2])
                i += 2
                continue
            if char == quote:
                quote = None
            current.append(char)
        elif char in "'\"":
            quote = char
            current.append(char)
        elif char == "\\" and i + 1 < len(command):
            current.append(command[i:i + 2])
            i += 2
            continue
        elif char in ";\n|&":
            segments.append("".join(current))
            current = []
            if command[i:i + 2] in ("&&", "||"):
                i += 1
        else:
            current.append(char)
        i += 1
    segments.append("".join(current))
    return [segment for segment in segments if segment.strip()]


def _tokenize(segment: str) -> List[str]:
    """Best-effort shell tokenization; falls back to a naive split."""
    try:
        return shlex.split(segment)
    except ValueError:
        return segment.split()


def _program_index(tokens: List[str], program: str) -> Optional[int]:
    for index, token in enumerate(tokens):
        if token == program or token.endswith("/" + program):
            return index
    return None


def _git_invocation(tokens: List[str]) -> Optional[Tuple[str, List[str], List[str]]]:
    """Return (verb, args, prefix) for the first git call in a segment.

    prefix holds the tokens in front of `git`, where a marker such as
    MARSAI_COMMIT_SKILL=1 sits. Only the verb and its flags are inspected;
    message bodies are never matched, so `git commit -m "merge two configs"`
    is not treated as a merge.
    """
    start = _program_index(tokens, "git")
    if start is None:
        return None
    j = start + 1
    while j < len(tokens):
        token = tokens[j]
        if token.startswith("-"):
            j += 2 if token in _GLOBAL_OPTS_WITH_VALUE and "=" not in token else 1
            continue
        return token, tokens[j + 1:], tokens[:start]
    return None


def _is_pr_create(tokens: List[str]) -> Optional[List[str]]:
    """Return the prefix tokens when the segment runs `gh pr create`, else None."""
    start = _program_index(tokens, "gh")
    if start is None:
        return None
    words = [token for token in tokens[start + 1:] if not token.startswith("-")]
    if words[:2] == ["pr", "create"]:
        return tokens[:start]
    return None


def _merge_in_progress(cwd: Optional[str]) -> bool:
    """True when the repo has a MERGE_HEAD (a merge is mid-flight)."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--verify", "--quiet", "MERGE_HEAD"],
            cwd=cwd or None,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False


def _merge_creates_commit(args: List[str]) -> bool:
    """A `git merge` that may produce a merge commit (i.e. not a safe form)."""
    safe = {"--abort", "--quit", "--ff-only"}
    return not any(a in safe for a in args)


def _pull_creates_commit(args: List[str]) -> bool:
    """A `git pull` that may produce a merge commit (not rebase / not ff-only)."""
    if "--ff-only" in args or "--rebase" in args or "-r" in args:
        return False
    for a in args:
        if a.startswith("--rebase="):
            return a.split("=", 1)[1].lower() in {"false", "no", "n", "0"}
    return True


# `$env:MARSAI_COMMIT_SKILL=1`, with or without quotes or spaces, after tokenizing.
_POWERSHELL_MARKER = re.compile(r"\$env:(MARSAI_(?:COMMIT|PR)_SKILL)=1", re.IGNORECASE)


def evaluate(command: str, merge_check: Callable[[], bool], linear_history: bool = True) -> Optional[str]:
    """Return a denial reason, or None to allow. Pure and unit-testable.

    merge_check() reports whether a merge is currently in progress; it is
    injected so the linear-history logic can be tested without a real repo.
    """
    unmarked_commit = False
    commit_present = False
    # Markers a PowerShell statement set for the rest of the command.
    env_markers = set()

    for segment in _split_segments(command):
        tokens = _tokenize(segment)

        powershell_marker = _POWERSHELL_MARKER.fullmatch("".join(tokens))
        if powershell_marker:
            env_markers.add(powershell_marker.group(1).upper() + "=1")
            continue

        pr_prefix = _is_pr_create(tokens)
        if pr_prefix is not None and "MARSAI_PR_SKILL=1" not in pr_prefix and "MARSAI_PR_SKILL=1" not in env_markers:
            return (
                "Direct PR creation blocked by MarsAI. Invoke /marsai-core:pr (the "
                "marsai-core:open-pr skill) so the PR carries evidence and the merge danger."
            )

        invocation = _git_invocation(tokens)
        if invocation is None:
            continue
        verb, args, prefix = invocation

        if linear_history and verb == "merge" and _merge_creates_commit(args):
            return (
                "git merge blocked by MarsAI. " + _LINEAR_HISTORY_HINT + " "
                "Use `git rebase <base>` and `git push --force-with-lease`. "
                "Only `git merge --ff-only` and `git merge --abort` are allowed."
            )

        if linear_history and verb == "pull" and _pull_creates_commit(args):
            return (
                "git pull without rebase blocked by MarsAI. " + _LINEAR_HISTORY_HINT + " "
                "Use `git pull --rebase` (or `git pull --ff-only`) so no merge commit is created."
            )

        if verb == "commit":
            commit_present = True
            if "MARSAI_COMMIT_SKILL=1" not in prefix and "MARSAI_COMMIT_SKILL=1" not in env_markers:
                unmarked_commit = True

    # A commit that would finalize an in-progress merge (MERGE_HEAD present).
    if linear_history and commit_present and merge_check():
        return (
            "Merge commit blocked by MarsAI: a merge is in progress (MERGE_HEAD). "
            + _LINEAR_HISTORY_HINT + " Run `git merge --abort` and redo it with "
            "`git rebase <base>` and `git push --force-with-lease`."
        )

    if unmarked_commit:
        return (
            "Direct git commit blocked by MarsAI. Invoke /marsai-core:commit; the "
            "skill organizes atomic commits and runs the command itself."
        )

    return None


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return

    tool_input = payload.get("tool_input") or {}
    command = tool_input.get("command", "")
    if not isinstance(command, str):
        return

    cwd = payload.get("cwd")
    linear_history = os.environ.get("MARSAI_LINEAR_HISTORY", "on").strip().lower() not in {"off", "0", "false", "no"}
    reason = evaluate(command, lambda: _merge_in_progress(cwd), linear_history)
    if reason:
        _deny(reason)


if __name__ == "__main__":
    main()
