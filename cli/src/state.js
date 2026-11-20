import fs from "node:fs";
import path from "node:path";
import { LAUNCHER_DIR } from "./constants.js";
import { isFile } from "./fs-utils.js";

/**
 * Per-target state file so `marsai status`, `update` and `remove` know what was
 * installed, where, and from which MarsAI release. Lives at <home>/.marsai-installer.json.
 */
export function statePath(home) {
  return path.join(home, ".marsai-installer.json");
}

export function readState(home) {
  try {
    const raw = JSON.parse(fs.readFileSync(statePath(home), "utf8"));
    return raw && typeof raw === "object" && Array.isArray(raw.targets)
      ? raw
      : emptyState();
  } catch {
    return emptyState();
  }
}

export function writeState(home, state) {
  state.updatedAt = new Date().toISOString();
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(statePath(home), JSON.stringify(state, null, 2) + "\n");
}

export function emptyState() {
  return { schema: 1, targets: [], plugins: [], version: null };
}

/** Merge one target result into state (what was synced, into where). */
export function recordTarget(home, target, payload) {
  const state = readState(home);
  const idx = state.targets.findIndex((t) => t.target === target);
  const entry = { target, ...payload, syncedAt: new Date().toISOString() };
  if (idx >= 0) state.targets[idx] = entry;
  else state.targets.push(entry);
  writeState(home, state);
}

export function removeTarget(home, target) {
  const state = readState(home);
  state.targets = state.targets.filter((t) => t.target !== target);
  writeState(home, state);
}

export function recordPlugins(home, plugins) {
  const state = readState(home);
  state.plugins = [
    ...new Set(state.targets.flatMap((target) => target.plugins || [])),
  ];
  writeState(home, state);
}

/** Where a root's bundled marketplace copy goes; `key` comes from `checkoutKey(root)`. */
export function checkoutPath(home, key) {
  return path.join(home, LAUNCHER_DIR, key);
}

/** Path where the launcher persisted the bundled marketplace checkout, if it did. */
export function launcherCheckoutPath(home, key) {
  const p = checkoutPath(home, key);
  return isFile(path.join(p, ".claude-plugin", "marketplace.json")) ? p : null;
}
