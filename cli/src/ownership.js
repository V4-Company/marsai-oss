import fs from "node:fs";
import path from "node:path";
import { readState } from "./state.js";

export const OWNER_MARKER = "installed-by: marsai";
const MARKER_FILE = ".marsai";
const TARGETS = new Set(["codex", "cursor", "opencode"]);
export function hasOwnerMarker(content) {
  return content.split(/\r?\n/).includes(OWNER_MARKER);
}
function safePath(home, location) {
  const relative = path.relative(home, location);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  let current = location;
  while (current !== home) {
    try { if (fs.lstatSync(current).isSymbolicLink()) return false; }
    catch (error) { if (error.code !== "ENOENT") return false; }
    current = path.dirname(current);
  }
  return true;
}
function markerContent(dir) {
  try {
    const file = path.join(dir, MARKER_FILE);
    if (fs.lstatSync(file).isSymbolicLink()) return "";
    return fs.readFileSync(file, "utf8");
  } catch { return ""; }
}
function ownersOf(home, dir, target, kind, shared) {
  const marker = markerContent(dir);
  if (!hasOwnerMarker(marker)) return [];
  const declared = marker.split(/\r?\n/).find((line) => line.startsWith("targets: "));
  if (declared) return declared.slice(9).split(",").filter((owner) => TARGETS.has(owner));
  // Legacy marker has no target. Only persisted claims establish its owners.
  const name = path.basename(dir);
  return readState(home).targets.filter((entry) =>
    (shared ? ["codex", "cursor"].includes(entry.target) : entry.target === target) &&
    entry[kind]?.includes(name)).map((entry) => entry.target);
}
function markDirectory(dir, owners) {
  fs.writeFileSync(path.join(dir, MARKER_FILE), `${OWNER_MARKER}\ntargets: ${[...new Set(owners)].sort().join(",")}\n`);
}
/** Refresh packaged contents, retaining every target that owns a shared skill. */
export function claimDirectory(home, dir, target, kind = "skills", shared = false) {
  if (!safePath(home, dir)) return false;
  let owners = [];
  if (fs.existsSync(dir)) {
    if (!fs.statSync(dir).isDirectory()) return false;
    const entries = fs.readdirSync(dir);
    const marked = hasOwnerMarker(markerContent(dir));
    if (entries.length && !marked) return false;
    owners = ownersOf(home, dir, target, kind, shared);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
  markDirectory(dir, [...owners, target]);
  return true;
}
function releaseDirectory(home, dir, target, kind, shared) {
  if (!safePath(home, dir)) return false;
  const owners = ownersOf(home, dir, target, kind, shared);
  if (!owners.includes(target)) return false;
  const remaining = owners.filter((owner) => owner !== target);
  if (remaining.length) markDirectory(dir, remaining);
  else fs.rmSync(dir, { recursive: true, force: true });
  return remaining.length === 0;
}
/** Release only this target's claims; other target skills and foreign files survive. */
export function pruneDirectories(home, base, target, kind, keep = [], shared = false) {
  const released = [];
  if (!safePath(home, base) || !fs.existsSync(base)) return released;
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (entry.isDirectory() && !keep.includes(entry.name) && releaseDirectory(home, path.join(base, entry.name), target, kind, shared)) released.push(entry.name);
  }
  return released;
}
export function ownedFile(home, file) {
  if (!safePath(home, file)) return false;
  try { return fs.statSync(file).isFile() && hasOwnerMarker(fs.readFileSync(file, "utf8")); }
  catch { return false; }
}
export function claimFile(home, file, legacyContent) {
  if (!safePath(home, file)) return false;
  if (fs.existsSync(file) && !ownedFile(home, file)) {
    if (legacyContent === undefined || !fs.statSync(file).isFile() || fs.readFileSync(file, "utf8") !== legacyContent) return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return true;
}
export function pruneFiles(home, base, keep = []) {
  const removed = [];
  if (!safePath(home, base) || !fs.existsSync(base)) return removed;
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const file = path.join(base, entry.name);
    if (entry.isFile() && !keep.includes(entry.name) && ownedFile(home, file)) {
      fs.rmSync(file);
      removed.push(entry.name);
    }
  }
  return removed;
}
