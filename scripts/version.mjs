#!/usr/bin/env node
// One version for everything public.
//
//   node scripts/version.mjs check          fails when the places that carry the version disagree
//   node scripts/version.mjs bump 5.1.0     writes the new version everywhere and opens its CHANGELOG entry
//   node scripts/version.mjs notes          prints the CHANGELOG entry of the current version
//
// The version lives in the public manifests because several things read it: npm and the
// installer (package.json), the marketplace listing, and Claude Code, which
// updates a plugin only when the string in its plugin.json changes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_FILES = [
  'package.json',
  '.claude-plugin/marketplace.json',
  'plugins/marsai-core/.claude-plugin/plugin.json',
  'plugins/marsai-dev/.claude-plugin/plugin.json',
  'plugins/marsai-extras/.claude-plugin/plugin.json',
];
const FORMULA = 'Formula/marsai.rb';
const CHANGELOG = 'CHANGELOG.md';

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const write = (file, text) => fs.writeFileSync(path.join(ROOT, file), text);
const versionOf = (file) => JSON.parse(read(file)).version;
const formulaTag = () => (read(FORMULA).match(/tag: "v([^"]+)"/) || [])[1];

/** The `## x.y.z` section of the changelog, without its heading. */
function notes(version) {
  const lines = read(CHANGELOG).split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  return rest.slice(0, end < 0 ? undefined : end).join('\n').trim();
}

function check() {
  const version = versionOf(JSON_FILES[0]);
  const problems = [];
  for (const file of JSON_FILES.slice(1)) {
    if (versionOf(file) !== version) problems.push(`${file} says ${versionOf(file)}, package.json says ${version}`);
  }
  if (formulaTag() !== version) problems.push(`${FORMULA} points to v${formulaTag()}, package.json says ${version}`);
  if (!/^\d+\.\d+\.\d+$/.test(version)) problems.push(`"${version}" is not MAJOR.MINOR.PATCH`);
  if (!notes(version)) problems.push(`${CHANGELOG} has no "## ${version}" entry with content`);
  if (problems.length) {
    console.log(`${problems.length} problem(s) with the version:\n\n  ${problems.join('\n  ')}\n\nRun: node scripts/version.mjs bump <version>`);
    return 1;
  }
  console.log(`ok: version ${version} everywhere`);
  return 0;
}

function bump(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version || '')) { console.log('usage: node scripts/version.mjs bump MAJOR.MINOR.PATCH'); return 1; }
  for (const file of JSON_FILES) {
    // Replace the first "version" only, so the formatting of the file stays as it is.
    write(file, read(file).replace(/("version":\s*")[^"]+(")/, `$1${version}$2`));
  }
  write(FORMULA, read(FORMULA).replace(/tag: "v[^"]+"/, `tag: "v${version}"`));
  if (!notes(version)) {
    const changelog = read(CHANGELOG);
    const at = changelog.indexOf('\n## ');
    const entry = `\n## ${version}\n\n- \n`;
    write(CHANGELOG, at < 0 ? changelog.trimEnd() + '\n' + entry : changelog.slice(0, at) + entry + changelog.slice(at));
    console.log(`Opened "## ${version}" in ${CHANGELOG}: write what changed, for whoever uses the flow.`);
  }
  console.log(`version ${version} written`);
  return 0;
}

const [command, argument] = process.argv.slice(2);
if (command === 'notes') {
  const text = notes(versionOf(JSON_FILES[0]));
  if (!text) process.exit(1);
  console.log(text);
} else process.exit(command === 'bump' ? bump(argument) : command === 'check' ? check() : (console.log('usage: node scripts/version.mjs check | bump <version> | notes'), 1));
