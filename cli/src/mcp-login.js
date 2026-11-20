import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { commandExists, launchCommand } from "./fs-utils.js";
import { localized, t } from "./i18n.js";
import { mcpConnectionName } from "./mcp.js";

/**
 * Ask whether the person already has access to a gated MCP provider. The notice
 * and the question are the ones the dependency declares in its `access` block.
 * Yes and no are accepted in English and in Portuguese, whatever the language.
 * @returns {Promise<{ ok: true, access: boolean } | { ok: false, message: string }>}
 */
export async function askAccess({ access, question, output = process.stdout }) {
  const notice = localized(access.notice);
  if (notice) output.write(`${notice}\n`);
  while (true) {
    let answer;
    try {
      answer = await question(
        `${localized(access.question)} ${t("yes.no")}: `,
      );
    } catch {
      return { ok: false, message: t("login.cancelled") };
    }
    if (typeof answer !== "string")
      return { ok: false, message: t("login.cancelled") };
    const value = answer.trim().toLowerCase();
    if (["s", "sim", "y", "yes"].includes(value))
      return { ok: true, access: true };
    if (["n", "não", "nao", "no"].includes(value))
      return { ok: true, access: false };
    output.write(`${t("login.answer")}\n`);
  }
}

export function terminalQuestion(rl, text) {
  return new Promise((resolve, reject) => {
    const close = () => {
      cleanup();
      reject(new Error(t("login.cancelled")));
    };
    const cleanup = () => rl.removeListener("close", close);
    rl.once("close", close);
    rl.question(text).then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

/**
 * Log in to an OAuth MCP through the client app that will use it. The installer
 * never sees a credential: it runs the app's own login command, in the home it
 * is installing into, and reports how that ended.
 * `access` is what the person said about having access: true starts the login,
 * false points to who grants it, undefined asks for the flag.
 */
export function startMcpLogin({
  home,
  target,
  dependency,
  access,
  configured,
  updating = false,
  dryRun = false,
  currentHome = os.homedir(),
  run = spawnSync,
  exists = commandExists,
  env = process.env,
}) {
  const { id, provider } = dependency;
  const contact = dependency.access?.contact;
  if (updating)
    return { state: "not-requested", message: t("login.notOnUpdate") };
  if (access === false)
    return {
      state: "access-required",
      message: contact
        ? t("login.askContact", { contact })
        : t("login.askAdmin"),
    };
  if (dryRun || path.resolve(home) !== path.resolve(currentHome))
    return { state: "isolated", message: t("login.isolated") };
  if (access !== true)
    return { state: "access-unknown", message: t("login.unknown", { id }) };
  if (!configured)
    return { state: "not-configured", message: t("login.notConfigured") };
  if (target === "cursor")
    return {
      state: "manual",
      message: t("login.cursor", { name: provider.name }),
    };
  const connection = mcpConnectionName({ home, target, dependency });
  if (!connection.ok)
    return { state: "not-configured", message: connection.message };
  if (!exists(target))
    return {
      state: "client-missing",
      message: t("login.clientMissing", { target }),
    };
  const childEnv = {
    ...env,
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex"),
    XDG_CONFIG_HOME: path.join(home, ".config"),
  };
  for (const key of [
    "CLAUDE_CONFIG_DIR",
    "OPENCODE_CONFIG",
    "OPENCODE_CONFIG_DIR",
    "OPENCODE_CONFIG_CONTENT",
  ])
    delete childEnv[key];
  /** Run the app's own command line, started the way this system starts it. */
  const client = (args, extra) => {
    const start = launchCommand(target, args, { env: childEnv });
    return run(start.command, start.args, {
      cwd: home,
      env: childEnv,
      shell: false,
      ...start.options,
      ...extra,
    });
  };
  if (target === "claude") {
    const help = client(["mcp", "--help"], {
      encoding: "utf8",
      timeout: 10000,
    });
    if (help.status !== 0 || !/\blogin\b/.test(help.stdout || ""))
      return {
        state: "manual",
        message: t("login.claude", { name: provider.name }),
      };
  }
  const result = client(
    ["mcp", target === "opencode" ? "auth" : "login", connection.name],
    { stdio: "inherit" },
  );
  if (result.status === 0)
    return { state: "client-success", message: t("login.success") };
  return {
    state: "client-error",
    exitCode: result.status,
    message: t("login.failed", {
      code: Number.isInteger(result.status) ? result.status : undefined,
    }),
  };
}
