import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/** The root this installer ships in: package.json, .claude-plugin/ and plugins/. */
export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const PKG_VERSION = require(path.join(ROOT, "package.json")).version;
export const LAUNCHER_DIR = path.join(".marsai", "marketplace");

export function releaseRef(version) {
  return `v${version}`;
}

/** Marker file that tracks what marsai installed in a target home dir. */
export const STATE_FILE = ".marsai-installer.json";
