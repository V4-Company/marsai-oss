import "./helpers/lang.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveChannel } from "../src/channel.js";
import { PKG_VERSION, releaseRef } from "../src/constants.js";

test("default channel is main when nothing is set", () => {
  assert.deepEqual(resolveChannel({}), {
    ok: true,
    channel: "main",
    origin: "default",
  });
});

test("flag wins over env and state", () => {
  assert.deepEqual(
    resolveChannel({ flag: "main", env: "stable", state: "stable" }),
    { ok: true, channel: "main", origin: "flag" },
  );
});

test("env wins over state", () => {
  assert.deepEqual(resolveChannel({ env: "stable", state: "main" }), {
    ok: true,
    channel: "stable",
    origin: "env",
  });
});

test("state is used when flag and env are absent", () => {
  assert.deepEqual(resolveChannel({ env: "", state: "stable" }), {
    ok: true,
    channel: "stable",
    origin: "state",
  });
});

test("invalid flag or env is a typed error", () => {
  const flag = resolveChannel({ flag: "beta" });
  assert.equal(flag.ok, false);
  assert.match(flag.message, /--channel/);
  assert.match(flag.message, /stable, main/);
  const env = resolveChannel({ env: "nightly" });
  assert.equal(env.ok, false);
  assert.match(env.message, /MARSAI_CHANNEL/);
});

test("unknown persisted channel falls back to the default", () => {
  assert.deepEqual(resolveChannel({ state: "garbage" }), {
    ok: true,
    channel: "main",
    origin: "default",
  });
});

test("release ref derives from the package version", () => {
  assert.equal(releaseRef("3.4.0"), "v3.4.0");
  assert.match(PKG_VERSION, /^\d+\.\d+\.\d+/);
});
