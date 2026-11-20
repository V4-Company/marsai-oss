import { test } from "node:test";
import assert from "node:assert/strict";
import {
  commandExists,
  findWindowsCommand,
  launchCommand,
} from "../src/fs-utils.js";

// How the installer starts another program (`claude`, `git`, the app that logs in
// to an MCP server) is decided from the platform, the PATH and the files found.
// These tests give all three, so the Windows rules are checked on any system.

const NPM = "C:\\Users\\Jo Silva\\AppData\\Roaming\\npm";
const LOCAL = "C:\\Users\\Jo Silva\\.local\\bin";
const windows = (files, env = {}) => ({
  platform: "win32",
  env: { Path: `${NPM};${LOCAL}`, PATHEXT: ".COM;.EXE;.BAT;.CMD;.JS", ...env },
  exists: (file) => files.includes(file),
});

/** What the command interpreter leaves of a line whose special characters are all escaped: `^x` is `x`. */
const unescaped = (line) => line.replace(/\^(.)/gs, "$1");

/** A command line split the way a Windows program reads its own arguments. */
function argumentsOf(line) {
  const found = [];
  let current = "";
  let started = false;
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    let slashes = 0;
    while (line[i] === "\\") {
      slashes += 1;
      i += 1;
    }
    if (line[i] === '"') {
      current += "\\".repeat(Math.floor(slashes / 2));
      if (slashes % 2) current += '"';
      else quoted = !quoted;
      started = true;
      continue;
    }
    current += "\\".repeat(slashes);
    if (slashes) started = true;
    if (i >= line.length) break;
    if (!quoted && line[i] === " ") {
      if (started) found.push(current);
      current = "";
      started = false;
      continue;
    }
    current += line[i];
    started = true;
  }
  if (started) found.push(current);
  return found;
}

test("outside Windows a command starts by its name, with its arguments untouched", () => {
  const args = ["plugin", "marketplace", "add", "/home/jo silva/copy"];
  for (const platform of ["linux", "darwin"])
    assert.deepEqual(launchCommand("claude", args, { platform }), {
      command: "claude",
      args,
      options: {},
    });
});

test("Windows: a program on the PATH is started by its full path, with no interpreter", () => {
  const exe = `${LOCAL}\\claude.exe`;
  const args = ["plugin", "marketplace", "add", "C:\\Users\\Jo Silva\\copy"];
  assert.deepEqual(launchCommand("claude", args, windows([exe])), {
    command: exe,
    args,
    options: {},
  });
  assert.equal(commandExists("claude", windows([exe])), true);
});

test("Windows: a batch file runs through the interpreter, with every argument arriving as it was given", () => {
  const shim = `${NPM}\\claude.cmd`;
  const args = [
    "plugin",
    "marketplace",
    "add",
    "C:\\Users\\Jo Silva (Work)\\.marsai\\marketplace\\acme--kit",
    "--sparse",
    ".claude-plugin",
    "acme/kit#v1.2.3",
    "a&b|c<d>e",
    "100%PATH%",
    'say "hi" & exit',
    "ends with a slash\\",
    'slash before a quote\\"',
    "",
    "^caret! and é",
  ];
  const start = launchCommand("claude", args, windows([shim], { ComSpec: "C:\\Windows\\System32\\cmd.exe" }));
  assert.equal(start.command, "C:\\Windows\\System32\\cmd.exe");
  assert.deepEqual(start.options, { windowsVerbatimArguments: true });
  assert.deepEqual(start.args.slice(0, 3), ["/d", "/s", "/c"]);
  assert.equal(start.args.length, 4);
  const [, line] = /^"(.*)"$/s.exec(start.args[3]);
  // The interpreter reads the batch file's path once and its arguments twice:
  // once here, once when the batch file passes them on to the program.
  const file = "C:\\Users\\Jo^ Silva\\AppData\\Roaming\\npm\\claude.cmd";
  assert.ok(line.startsWith(`${file} `), line);
  assert.equal(unescaped(file), shim);
  const passed = line.slice(file.length + 1);
  // Nothing the interpreter acts on is left unescaped at either reading.
  for (const reading of [passed, unescaped(passed)])
    assert.doesNotMatch(reading.replace(/\^./gs, ""), /[()%!"<>&|^]/, reading);
  assert.deepEqual(argumentsOf(unescaped(unescaped(passed))), args);
});

test("Windows: the first match along the PATH wins, then the order of PATHEXT", () => {
  const exe = `${LOCAL}\\claude.exe`;
  const shim = `${NPM}\\claude.cmd`;
  assert.equal(findWindowsCommand("claude", windows([exe, shim])), shim);
  assert.equal(
    findWindowsCommand("claude", windows([exe, shim], { Path: `${LOCAL};${NPM}` })),
    exe,
  );
  assert.equal(
    findWindowsCommand("claude", windows([`${NPM}\\claude.exe`, shim])),
    `${NPM}\\claude.exe`,
  );
  // The variable is found whatever its case, a quoted folder is read without
  // the quotes, and a missing PATHEXT means the usual extensions.
  assert.equal(
    findWindowsCommand("claude", {
      env: { PATH: `"${LOCAL}";;` },
      exists: (file) => file === exe,
    }),
    exe,
  );
  // A name that already has its extension is looked up as it is.
  assert.equal(findWindowsCommand("claude.cmd", windows([exe, shim])), shim);
});

test("Windows: a file that is neither a program nor a batch file is not the command", () => {
  const script = `${NPM}\\claude.js`;
  const bare = `${NPM}\\claude`;
  const found = windows([script, bare]);
  assert.equal(findWindowsCommand("claude", found), null);
  assert.equal(commandExists("claude", found), false);
  // Not found: the name goes as it is, and failing to start it is reported by the caller.
  assert.deepEqual(launchCommand("claude", ["--version"], found), {
    command: "claude",
    args: ["--version"],
    options: {},
  });
});
