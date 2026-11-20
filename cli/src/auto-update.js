import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { t } from "./i18n.js";
import { npxSpec, primaryRoot } from "./roots.js";
// Identifies the task already installed on people's machines; changing it would orphan that task.
const LABEL = "com.v4company.marsai.update";
const xml = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
/**
 * `spec` is what the daily task hands to npx: the distribution that installed
 * the content, taken from its `package.json` repository. `extraRoots` are the
 * root directories that distribution would not load by itself; the task gets
 * them in `MARSAI_EXTRA_ROOTS`, so the daily run sees the same plugins.
 */
export function configureAutoUpdate(
  home,
  {
    enabled,
    dryRun = false,
    userHome = os.homedir(),
    unload = true,
    platform = process.platform,
    run = spawnSync,
    pathEnv = process.env.PATH || "",
    spec = npxSpec(primaryRoot()),
    extraRoots = [],
  } = {},
) {
  if (!["darwin", "linux"].includes(platform))
    return {
      status: "unsupported",
      message: t("auto.unsupported"),
    };
  const file =
    platform === "darwin"
      ? path.join(home, "Library/LaunchAgents", `${LABEL}.plist`)
      : path.join(home, ".config/systemd/user/marsai-update.timer");
  const service = path.join(home, ".config/systemd/user/marsai-update.service");
  const safe = path.resolve(home) !== path.resolve(userHome);
  if (dryRun)
    return {
      status: "dry-run",
      path: file,
      message: t("auto.dryRun", { enabled }),
    };
  if (!enabled) {
    if (unload && !safe && fs.existsSync(file)) {
      const r =
        platform === "darwin"
          ? run("launchctl", ["bootout", `gui/${process.getuid()}`, file], {
              encoding: "utf8",
            })
          : run(
              "systemctl",
              ["--user", "disable", "--now", "marsai-update.timer"],
              { encoding: "utf8" },
            );
      if (r.status !== 0)
        return {
          status: "error",
          path: file,
          message: t("auto.disableFailed"),
        };
    }
    fs.rmSync(file, { force: true });
    if (platform === "linux") fs.rmSync(service, { force: true });
    return {
      status: "disabled",
      message: unload ? t("auto.disabled") : t("auto.disabledLater"),
    };
  }
  if (!spec)
    return {
      status: "unsupported",
      message: t("auto.noRepository"),
    };
  const npx = path.join(
    path.dirname(process.execPath),
    process.platform === "win32" ? "npx.cmd" : "npx",
  );
  const searchPath = [
    ...new Set(
      [
        path.dirname(process.execPath),
        ...pathEnv.split(path.delimiter),
        path.join(home, ".local", "bin"),
        "/opt/homebrew/bin",
        "/usr/local/bin",
        "/usr/bin",
        "/bin",
        "/usr/sbin",
        "/sbin",
      ].filter(
        (entry) =>
          path.isAbsolute(entry) && !/[\u0000-\u001f\u007f]/.test(entry),
      ),
    ),
  ].join(path.delimiter);
  const command = [
    npx,
    "--yes",
    spec,
    "update",
    "--scheduled",
    "--home",
    home,
  ];
  const environment = [
    ["PATH", searchPath],
    ...(extraRoots.length
      ? [["MARSAI_EXTRA_ROOTS", extraRoots.join(path.delimiter)]]
      : []),
  ];
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const log = path.join(home, ".marsai", "update.log");
  fs.mkdirSync(path.dirname(log), { recursive: true });
  if (platform === "darwin") {
    fs.writeFileSync(
      file,
      `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>Label</key><string>${LABEL}</string><key>ProgramArguments</key><array>${command.map((x) => `<string>${xml(x)}</string>`).join("")}</array><key>StartInterval</key><integer>86400</integer><key>EnvironmentVariables</key><dict>${environment.map(([key, value]) => `<key>${key}</key><string>${xml(value)}</string>`).join("")}</dict><key>StandardOutPath</key><string>${xml(log)}</string><key>StandardErrorPath</key><string>${xml(log)}</string></dict></plist>\n`,
    );
  } else {
    const quote = (value) =>
      '"' +
      value
        .replaceAll("\\", "\\\\")
        .replaceAll('"', '\\"')
        .replaceAll("%", "%%") +
      '"';
    fs.writeFileSync(
      service,
      `[Unit]\nDescription=MarsAI selected plugins update\n[Service]\nType=oneshot\n${environment.map(([key, value]) => `Environment=${quote(`${key}=${value}`)}\n`).join("")}ExecStart=${command.map(quote).join(" ")}\n`,
    );
    fs.writeFileSync(
      file,
      "[Unit]\nDescription=MarsAI daily update\n[Timer]\nOnCalendar=daily\nPersistent=true\n[Install]\nWantedBy=timers.target\n",
    );
  }
  if (safe)
    return {
      status: "prepared",
      path: file,
      message: t("auto.preparedIsolated"),
    };
  if (!fs.existsSync(npx))
    return {
      status: "prepared",
      path: file,
      message: t("auto.noNpx"),
    };
  if (platform === "darwin")
    run("launchctl", ["bootout", `gui/${process.getuid()}`, file], {
      encoding: "utf8",
    });
  else run("systemctl", ["--user", "daemon-reload"], { encoding: "utf8" });
  const result =
    platform === "darwin"
      ? run("launchctl", ["bootstrap", `gui/${process.getuid()}`, file], {
          encoding: "utf8",
        })
      : run("systemctl", ["--user", "enable", "--now", "marsai-update.timer"], {
          encoding: "utf8",
        });
  return {
    status: result.status === 0 ? "enabled" : "prepared",
    path: file,
    message:
      result.status === 0 ? t("auto.enabled") : t("auto.activationFailed"),
  };
}
/**
 * Whether the task the state points to runs `spec`. A task written by another
 * distribution runs that distribution, whatever the state says about it.
 */
export function autoUpdateRuns(saved, spec) {
  if (!saved?.path || !spec) return false;
  // On Linux the state keeps the timer; the command is in the service beside it.
  const file = saved.path.replace(/\.timer$/, ".service");
  try {
    return fs.readFileSync(file, "utf8").includes(spec);
  } catch {
    return false;
  }
}
export function autoUpdateStatus(saved) {
  return saved?.path && !fs.existsSync(saved.path)
    ? { ...saved, status: "missing" }
    : saved;
}
