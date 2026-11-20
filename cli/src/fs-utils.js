import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Extensions Windows starts by itself, and the ones only its command interpreter runs. */
const WINDOWS_PROGRAMS = [".com", ".exe"];
const WINDOWS_SCRIPTS = [".bat", ".cmd"];
/** Characters the Windows command interpreter acts on. */
const WINDOWS_META = /([()\][%!^"`<>&|;, *?])/g;

/** An environment variable by name. On Windows the name has no fixed case (`Path`, `PATH`). */
function envValue(env, name) {
  const key = Object.keys(env).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return key === undefined ? undefined : env[key];
}

/**
 * The file Windows would start for the bare name `name`: the first match along
 * PATH, trying the extensions of PATHEXT in order inside each folder. Only
 * programs and batch files count, and the current folder is not searched, so a
 * file dropped into a project is never taken for the command.
 * @returns {string|null} the full path
 */
export function findWindowsCommand(
  name,
  { env = process.env, exists = isFile } = {},
) {
  const known = [...WINDOWS_PROGRAMS, ...WINDOWS_SCRIPTS];
  const declared = (envValue(env, "PATHEXT") || "")
    .split(";")
    .map((extension) => extension.trim().toLowerCase())
    .filter((extension) => known.includes(extension));
  const names = known.includes(path.win32.extname(name).toLowerCase())
    ? [name]
    : (declared.length ? declared : known).map(
        (extension) => `${name}${extension}`,
      );
  for (const entry of (envValue(env, "PATH") || "").split(";")) {
    const folder = entry.trim().replace(/^"(.*)"$/, "$1");
    if (!folder) continue;
    for (const candidate of names) {
      const file = path.win32.join(folder, candidate);
      if (exists(file)) return file;
    }
  }
  return null;
}

/** One argument as the started program reads it back: quoted, with the backslashes before a quote doubled. */
function windowsArgument(value) {
  return `"${String(value)
    .replace(/(\\*)"/g, '$1$1\\"')
    .replace(/(\\*)$/, "$1$1")}"`;
}

/**
 * What to hand to `spawnSync` to start the program `name` with `args`.
 *
 * Outside Windows the name and the arguments go as they are. On Windows a bare
 * name starts only an `.exe`, and a command installed by npm is a `.cmd` file,
 * which runs only through the command interpreter. So the name is looked up
 * first. A program is started by its full path. A batch file is handed to the
 * interpreter as one line: each argument is quoted for the program that ends up
 * reading it, and every character the interpreter acts on is escaped with `^`,
 * twice for the arguments because a batch file reads them again when it passes
 * them on. A name that is not found goes as it is, so the caller reports the
 * failure to start it.
 * @returns {{ command: string, args: string[], options: { windowsVerbatimArguments?: boolean } }}
 */
export function launchCommand(
  name,
  args = [],
  { platform = process.platform, env = process.env, exists = isFile } = {},
) {
  const direct = (command) => ({ command, args, options: {} });
  if (platform !== "win32") return direct(name);
  const file = findWindowsCommand(name, { env, exists });
  if (!file) return direct(name);
  if (!WINDOWS_SCRIPTS.includes(path.win32.extname(file).toLowerCase()))
    return direct(file);
  const escape = (text) => text.replace(WINDOWS_META, "^$1");
  const line = [
    escape(file),
    ...args.map((arg) => escape(escape(windowsArgument(arg)))),
  ].join(" ");
  return {
    command: envValue(env, "ComSpec") || "cmd.exe",
    args: ["/d", "/s", "/c", `"${line}"`],
    options: { windowsVerbatimArguments: true },
  };
}

export function commandExists(
  cmd,
  { platform = process.platform, env = process.env, exists = isFile } = {},
) {
  if (platform === "win32")
    return findWindowsCommand(cmd, { env, exists }) !== null;
  const r = spawnSync("/bin/sh", ["-c", `command -v ${JSON.stringify(cmd)} >/dev/null 2>&1`]);
  return r.status === 0;
}

export function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

export function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Resolve the home directory an installer should write to (respects --home override / MARSAI_HOME). */
export function targetHome(flagHome) {
  const home = flagHome || process.env.MARSAI_HOME || os.homedir();
  return path.resolve(home);
}
