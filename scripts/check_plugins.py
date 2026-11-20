#!/usr/bin/env python3
"""Static checks for the MarsAI plugins.

Catches the failures that `claude plugin validate` reports late or not at all:
frontmatter that does not parse (the component then loads with no metadata and
never triggers), keys the platform ignores, a name that differs from its folder,
and relative links that point nowhere or leave the plugin.

Also checks what the installer reads from each plugin folder: `.marsai-plugin.json`
(targets, group, legacy skills) and the MCP providers declared in
`.marsai-dependencies.json`. The installer leaves out a plugin whose manifest it
cannot read, so a mistake there has to fail here.

Usage: python3 scripts/check_plugins.py   (exit code 1 when anything fails)
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PLUGINS = ROOT / "plugins"

ALLOWED_KEYS = {
    "skill": {"name", "description", "version", "allowed-tools", "user-invocable",
              "disable-model-invocation", "argument-hint", "license"},
    "agent": {"name", "description", "model", "tools", "color", "effort"},
    "command": {"description", "argument-hint", "allowed-tools", "disable-model-invocation"},
}
INSTALLER_MANIFEST = ".marsai-plugin.json"
INSTALLER_TARGETS = {"claude", "codex", "cursor", "opencode"}
INSTALLER_LANGUAGES = {"en", "pt-BR"}
INSTALLER_KEYS = {
    "manifest": {"schemaVersion", "targets", "group", "legacySkills", "optional"},
    "group": {"id", "aliases", "label", "description"},
    "dependency": {"id", "skills", "required", "provider", "access"},
    "provider": {"name", "docs", "auth", "url", "path", "acceptedPaths", "setupHint"},
    "access": {"notice", "question", "contact"},
}
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]*$")
FRONTMATTER = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
FENCE = re.compile(r"^(```|~~~).*?^\1", re.DOTALL | re.MULTILINE)
INLINE_CODE = re.compile(r"`[^`\n]*`")
LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")

errors: list[str] = []


def fail(path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT).as_posix()}: {message}")


def frontmatter(path: Path, kind: str) -> dict | None:
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER.match(text)
    if not match:
        fail(path, "no frontmatter block at the top of the file")
        return None
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as error:
        reason = " ".join(str(error).split())
        fail(path, f"frontmatter is not valid YAML, so the component loads with no metadata ({reason})")
        return None
    if not isinstance(data, dict):
        fail(path, "frontmatter is not a key: value mapping")
        return None
    unknown = sorted(set(data) - ALLOWED_KEYS[kind])
    if unknown:
        fail(path, f"frontmatter keys the platform ignores: {', '.join(unknown)}")
    description = data.get("description")
    if not isinstance(description, str) or not description.strip():
        fail(path, "missing description")
    return data


def check_name(path: Path, data: dict, expected: str) -> None:
    name = data.get("name")
    if name != expected:
        fail(path, f"name is {name!r}; it has to be {expected!r}, the folder or file name")
    elif ":" in name:
        fail(path, "name contains ':'; the plugin is the namespace")


def check_links(path: Path, plugin_root: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = FRONTMATTER.sub("", text, count=1)
    text = INLINE_CODE.sub("", FENCE.sub("", text))
    for target in LINK.findall(text):
        if re.match(r"^(https?:|mailto:|#|/)", target) or "<" in target:
            continue
        file_part = target.split("#", 1)[0]
        if not file_part:
            continue
        resolved = (path.parent / file_part).resolve()
        if plugin_root.resolve() not in resolved.parents and resolved != plugin_root.resolve():
            fail(path, f"link leaves the plugin and will not exist once installed: {target}")
        elif not resolved.exists():
            fail(path, f"link points to a file that does not exist: {target}")


def is_slug(value: object) -> bool:
    return isinstance(value, str) and bool(SLUG.match(value))


def is_text(value: object) -> bool:
    """A text the installer shows: one string, or one string per language."""
    if isinstance(value, str):
        return bool(value.strip())
    return (
        isinstance(value, dict)
        and bool(value)
        and set(value) <= INSTALLER_LANGUAGES
        and all(isinstance(text, str) and text.strip() for text in value.values())
    )


def is_route(value: object) -> bool:
    return isinstance(value, str) and value.startswith("/")


def unknown_keys(path: Path, data: dict, kind: str) -> None:
    unknown = sorted(set(data) - INSTALLER_KEYS[kind])
    if unknown:
        fail(path, f"{kind} keys the installer ignores: {', '.join(unknown)}")


def load_json(path: Path) -> dict | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        fail(path, f"is not valid JSON ({error})")
        return None
    if not isinstance(data, dict):
        fail(path, "has to be a JSON object")
        return None
    return data


def check_installer_manifest(plugin: Path) -> dict | None:
    """Validate `.marsai-plugin.json` and return the plugin's group, if it declares one."""
    path = plugin / INSTALLER_MANIFEST
    if not path.is_file():
        fail(plugin, f"missing {INSTALLER_MANIFEST}, so the installer does not distribute this plugin")
        return None
    data = load_json(path)
    if data is None:
        return None
    unknown_keys(path, data, "manifest")
    if "optional" in data and not isinstance(data["optional"], bool):
        fail(path, "optional has to be a boolean")
    if data.get("schemaVersion") != 1:
        fail(path, "schemaVersion has to be 1")
    targets = data.get("targets")
    if not isinstance(targets, list) or not targets:
        fail(path, f"targets has to list at least one of: {', '.join(sorted(INSTALLER_TARGETS))}")
    else:
        unknown = sorted(str(target) for target in targets if target not in INSTALLER_TARGETS)
        if unknown:
            fail(path, f"targets the installer does not know: {', '.join(unknown)}")
    legacy = data.get("legacySkills")
    if legacy is not None and not (isinstance(legacy, list) and all(is_slug(name) for name in legacy)):
        fail(path, "legacySkills has to be a list of skill names")
    group = data.get("group")
    if group is None:
        return None
    if not isinstance(group, dict) or not is_slug(group.get("id")):
        fail(path, "group needs an id in kebab-case")
        return None
    unknown_keys(path, group, "group")
    aliases = group.get("aliases")
    if aliases is not None and not (isinstance(aliases, list) and all(is_slug(name) for name in aliases)):
        fail(path, "group.aliases has to be a list of names in kebab-case")
    for key in ("label", "description"):
        if key in group and not is_text(group[key]):
            fail(path, f"group.{key} has to be a text, or one text per language ({', '.join(sorted(INSTALLER_LANGUAGES))})")
    return group


def check_dependency(path: Path, entry: object, skill_names: set[str]) -> None:
    if not isinstance(entry, dict) or not is_slug(entry.get("id")):
        fail(path, "every mcp entry needs an id in kebab-case")
        return
    name = entry["id"]
    unknown_keys(path, entry, "dependency")
    missing = sorted(set(entry.get("skills", [])) - skill_names)
    if missing:
        fail(path, f"lists skills this plugin does not have: {', '.join(missing)}")
    provider = entry.get("provider")
    if provider is not None:
        if not isinstance(provider, dict) or not is_text(provider.get("name")):
            fail(path, f"{name}: provider needs a name")
        else:
            unknown_keys(path, provider, "provider")
            accepted = provider.get("acceptedPaths", [])
            if not isinstance(accepted, list):
                fail(path, f"{name}: provider.acceptedPaths has to be a list of routes")
                accepted = []
            routes = [route for route in (provider.get("path"), *accepted) if route is not None]
            if not all(is_route(route) for route in routes):
                fail(path, f"{name}: provider routes have to start with '/'")
            if "setupHint" in provider and not is_text(provider["setupHint"]):
                fail(path, f"{name}: provider.setupHint has to be a text")
    access = entry.get("access")
    if access is not None:
        if not isinstance(access, dict) or not is_text(access.get("question")):
            fail(path, f"{name}: access needs the question the installer asks")
        else:
            unknown_keys(path, access, "access")
            if "notice" in access and not is_text(access["notice"]):
                fail(path, f"{name}: access.notice has to be a text")


def check_plugin(plugin: Path) -> dict | None:
    manifest = plugin / ".claude-plugin" / "plugin.json"
    if not manifest.is_file():
        fail(plugin, "missing .claude-plugin/plugin.json")
    else:
        declared = set(json.loads(manifest.read_text(encoding="utf-8"))) & {"skills", "agents", "commands"}
        if declared:
            fail(manifest, f"declares {', '.join(sorted(declared))}; leave discovery automatic")

    skill_names: set[str] = set()
    skills = plugin / "skills"
    if skills.is_dir():
        for folder in sorted(p for p in skills.iterdir() if p.is_dir()):
            skill = folder / "SKILL.md"
            if not skill.is_file():
                fail(folder, "skill folder without SKILL.md")
                continue
            skill_names.add(folder.name)
            data = frontmatter(skill, "skill")
            if data is not None:
                check_name(skill, data, folder.name)

    agents = plugin / "agents"
    if agents.is_dir():
        for agent in sorted(agents.glob("*.md")):
            data = frontmatter(agent, "agent")
            if data is not None:
                check_name(agent, data, agent.stem)

    commands = plugin / "commands"
    if commands.is_dir():
        for command in sorted(commands.glob("*.md")):
            frontmatter(command, "command")

    for markdown in sorted(plugin.rglob("*.md")):
        check_links(markdown, plugin)

    for dependencies in sorted(plugin.rglob(".marsai-dependencies.json")):
        data = load_json(dependencies)
        if data is None:
            continue
        if data.get("schemaVersion") != 1 or not isinstance(data.get("mcp"), list):
            fail(dependencies, "needs schemaVersion 1 and an mcp list")
            continue
        for entry in data["mcp"]:
            check_dependency(dependencies, entry, skill_names)

    return check_installer_manifest(plugin)


def check_groups(groups: dict[str, list[dict]]) -> None:
    """A group is named by the first plugin that states its label, so one of them has to."""
    for name, declared in sorted(groups.items()):
        if not any("label" in group for group in declared):
            errors.append(f"group {name}: no plugin gives it a label in {INSTALLER_MANIFEST}")


def main() -> int:
    marketplace = json.loads((ROOT / ".claude-plugin" / "marketplace.json").read_text(encoding="utf-8"))
    listed = {entry["name"] for entry in marketplace["plugins"]}
    on_disk = {p.name for p in PLUGINS.iterdir() if p.is_dir()}
    for name in sorted(listed - on_disk):
        errors.append(f".claude-plugin/marketplace.json: lists {name}, which has no folder in plugins/")
    for name in sorted(on_disk - listed):
        errors.append(f"plugins/{name}: not listed in .claude-plugin/marketplace.json, so nobody can install it")

    groups: dict[str, list[dict]] = {}
    for plugin in sorted(PLUGINS.iterdir()):
        if plugin.is_dir():
            group = check_plugin(plugin)
            if group is not None:
                groups.setdefault(group["id"], []).append(group)
    check_groups(groups)

    if errors:
        print(f"{len(errors)} problem(s):\n")
        for error in errors:
            print(f"  {error}")
        return 1
    print(f"ok: {len(on_disk)} plugins checked")
    return 0


if __name__ == "__main__":
    sys.exit(main())
