#!/usr/bin/env python3
"""Unit tests for the MarsAI pre-tool-use guard.

Run: python3 plugins/marsai-core/hooks/pre-tool-use.test.py
Pure decision logic only; the MERGE_HEAD probe is injected as a stub.
"""
import importlib.util
import pathlib
import unittest

_HOOK = pathlib.Path(__file__).with_name("pre-tool-use.py")
_spec = importlib.util.spec_from_file_location("pre_tool_use", _HOOK)
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)

NO_MERGE = lambda: False
IN_MERGE = lambda: True


def blocked(command, merge_check=NO_MERGE, linear_history=True):
    return guard.evaluate(command, merge_check, linear_history) is not None


class MergeGuard(unittest.TestCase):
    def test_plain_merge_blocked(self):
        self.assertTrue(blocked("git merge origin/main"))

    def test_no_ff_merge_blocked(self):
        self.assertTrue(blocked("git merge --no-ff feature"))

    def test_merge_continue_blocked(self):
        self.assertTrue(blocked("git merge --continue"))

    def test_ff_only_allowed(self):
        self.assertFalse(blocked("git merge --ff-only origin/main"))

    def test_merge_abort_allowed(self):
        self.assertFalse(blocked("git merge --abort"))

    def test_merge_with_C_flag_blocked(self):
        self.assertTrue(blocked("git -C /repo merge origin/main"))


class PullGuard(unittest.TestCase):
    def test_plain_pull_blocked(self):
        self.assertTrue(blocked("git pull"))

    def test_pull_no_rebase_blocked(self):
        self.assertTrue(blocked("git pull --no-rebase"))

    def test_pull_rebase_false_blocked(self):
        self.assertTrue(blocked("git pull --rebase=false"))

    def test_pull_rebase_allowed(self):
        self.assertFalse(blocked("git pull --rebase"))

    def test_pull_rebase_true_allowed(self):
        self.assertFalse(blocked("git pull --rebase=true origin main"))

    def test_pull_ff_only_allowed(self):
        self.assertFalse(blocked("git pull --ff-only"))


class LinearHistorySwitch(unittest.TestCase):
    def test_merge_allowed_when_switched_off(self):
        self.assertFalse(blocked("git merge origin/main", linear_history=False))

    def test_pull_allowed_when_switched_off(self):
        self.assertFalse(blocked("git pull", linear_history=False))

    def test_commit_during_merge_allowed_when_switched_off(self):
        self.assertFalse(blocked('MARSAI_COMMIT_SKILL=1 git commit -m "merge"', IN_MERGE, linear_history=False))

    def test_commit_marker_still_required_when_switched_off(self):
        self.assertTrue(blocked('git commit -m "wip"', linear_history=False))


class CommitDuringMerge(unittest.TestCase):
    MARKED = 'MARSAI_COMMIT_SKILL=1 git commit -S -m "fix: x"'

    def test_commit_during_merge_blocked_even_with_marker(self):
        self.assertTrue(blocked(self.MARKED, IN_MERGE))

    def test_normal_commit_with_marker_allowed(self):
        self.assertFalse(blocked(self.MARKED, NO_MERGE))


class SkillMarkers(unittest.TestCase):
    def test_commit_without_marker_blocked(self):
        self.assertTrue(blocked('git commit -m "wip"'))

    def test_commit_with_C_flag_without_marker_blocked(self):
        self.assertTrue(blocked('git -C repo commit -m "wip"'))

    def test_marker_in_message_does_not_count(self):
        self.assertTrue(blocked('git commit -m "MARSAI_COMMIT_SKILL=1"'))

    def test_marker_before_other_env_allowed(self):
        self.assertFalse(blocked('MARSAI_COMMIT_SKILL=1 GIT_EDITOR=true git commit -m "fix: x" --trailer "Ref: 1"'))

    def test_commit_message_containing_merge_word_allowed(self):
        # verb is commit, not merge; message content must never trigger the merge rule
        self.assertFalse(blocked('MARSAI_COMMIT_SKILL=1 git commit -m "fix: merge two configs"'))

    def test_commit_message_containing_a_command_allowed(self):
        self.assertFalse(blocked('MARSAI_COMMIT_SKILL=1 git commit -m "docs: say; git merge b is blocked"'))

    def test_pr_create_without_marker_blocked(self):
        self.assertTrue(blocked('gh pr create --title x --body y'))

    def test_pr_create_with_marker_allowed(self):
        self.assertFalse(blocked('MARSAI_PR_SKILL=1 gh pr create --title x --body y'))

    def test_pr_view_allowed(self):
        self.assertFalse(blocked('gh pr view 12 --json body'))


class NoFalsePositives(unittest.TestCase):
    def test_log_merges_allowed(self):
        self.assertFalse(blocked("git log --merges --oneline"))

    def test_branch_merged_allowed(self):
        self.assertFalse(blocked("git branch --merged main"))

    def test_merge_base_allowed(self):
        self.assertFalse(blocked("git merge-base HEAD origin/main"))

    def test_rebase_allowed(self):
        self.assertFalse(blocked("git rebase origin/main"))

    def test_cherry_pick_allowed(self):
        self.assertFalse(blocked("git cherry-pick abc123"))

    def test_echo_git_merge_string_allowed(self):
        self.assertFalse(blocked('echo "git merge" | cat'))

    def test_echo_git_commit_string_allowed(self):
        self.assertFalse(blocked('echo "git commit"'))

    def test_grep_for_git_commit_allowed(self):
        self.assertFalse(blocked('grep -r "git commit" docs'))

    def test_push_force_with_lease_allowed(self):
        self.assertFalse(blocked("git push --force-with-lease"))


class PowerShellMarker(unittest.TestCase):
    """Codex on Windows runs commands in PowerShell, where the marker is a statement."""

    def test_marked_commit_allowed(self):
        self.assertFalse(blocked("$env:MARSAI_COMMIT_SKILL=1; git commit -m 'feat: x'"))

    def test_quoted_marker_allowed(self):
        self.assertFalse(blocked("$env:MARSAI_COMMIT_SKILL = '1'; git commit -m x"))

    def test_marked_pr_allowed(self):
        self.assertFalse(blocked("$env:MARSAI_PR_SKILL=1; gh pr " + "create --title t --body-file b.md"))

    def test_commit_marker_does_not_open_pr(self):
        self.assertTrue(blocked("$env:MARSAI_COMMIT_SKILL=1; gh pr " + "create --title t"))

    def test_unmarked_commit_still_blocked(self):
        self.assertTrue(blocked("$env:OTHER=1; git commit -m x"))

    def test_marker_text_in_a_message_does_not_count(self):
        self.assertTrue(blocked("git commit -m '$env:MARSAI_COMMIT_SKILL=1'"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
