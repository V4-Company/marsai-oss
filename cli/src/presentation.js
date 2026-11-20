import os from "node:os";
import path from "node:path";
import { targetHome } from "./fs-utils.js";
import { t } from "./i18n.js";
export const APP_NAMES = {
  claude: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
  opencode: "OpenCode",
};
export const isTestMode = (args) =>
  targetHome(args.home) !== path.resolve(os.homedir());
export function contentSummary(names) {
  const parts = [];
  for (const kind of ["skills", "agents", "commands", "commandSkills", "rules"]) {
    const n = names?.[kind]?.length || 0;
    if (n) parts.push(t("present.count", { kind, n }));
  }
  return parts.length
    ? t("present.installed", { parts: parts.join(", ") })
    : t("present.nothing");
}
/**
 * `item` is one MCP result: `name` is the provider's display name, `detail` what
 * happened and `login` the client command that logs in, when there is one.
 */
export function integrationLines(
  item,
  { target, testMode = false, dryRun = false, login } = {},
) {
  const title = item.name || item.id;
  const lines = [
    `\n  ${title}${item.required === false ? t("present.optional") : ""}`,
  ];
  if (login?.state === "client-success") {
    lines.push(
      `    ${t("present.loginDone")}`,
      `    ${t("present.permissions")}`,
    );
    if (item.state === "error")
      lines.push(`    ${t("present.unverified", { message: item.message })}`);
    return lines;
  }
  if (login?.state === "access-required") {
    lines.push(
      `    ${t("present.accessPending", { name: title })}`,
      `    ${login.message}`,
    );
    if (item.state === "error") lines.push(`    ${item.message}`);
    return lines;
  }
  const states = [
    "verified",
    "auth-pending",
    "configured",
    "missing",
    "error",
    "skipped",
  ];
  const state = !states.includes(item.state)
    ? "unknown"
    : item.state === "missing" && dryRun
      ? "missingDryRun"
      : item.state;
  lines.push(`    ${t(`present.state.${state}`)}`);
  const detail = (item.detail ?? item.message ?? "").trim();
  if (["error", "configured"].includes(item.state) && detail)
    lines.push(`    ${detail}`);
  if (login && !["not-requested", "isolated"].includes(login.state)) {
    lines.push(`    ${login.message}`);
    return lines;
  }
  if (item.state === "auth-pending") {
    if (testMode) lines.push(`    ${t("login.isolated")}`);
    else {
      const action =
        item.login ||
        t(
          `present.action.${["claude", "cursor"].includes(target) ? target : "other"}`,
        );
      lines.push(`    ${t("present.nextStep")}`, `      ${action}`);
    }
  }
  return lines;
}
export function autoUpdateSummary(value) {
  const summary = t("present.autoUpdate", { status: value?.status });
  return value?.status === "prepared" && value.message
    ? `${summary}\n  ${value.message}`
    : summary;
}
