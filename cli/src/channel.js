import { t } from "./i18n.js";

export const CHANNELS = ["stable", "main"];
export const DEFAULT_CHANNEL = "main";

function pick(value, origin, label) {
  if (CHANNELS.includes(value)) return { ok: true, channel: value, origin };
  return {
    ok: false,
    message: t("channel.invalid", {
      label,
      value,
      valid: CHANNELS.join(", "),
    }),
  };
}

/**
 * Precedence is flag > MARSAI_CHANNEL > persisted state > default. An unknown
 * persisted value is ignored instead of rejected, so a hand-edited state file
 * never blocks `update` or `remove`.
 * @param {{ flag?: string, env?: string, state?: string }} sources
 * @returns {{ ok: true, channel: string, origin: "flag"|"env"|"state"|"default" } | { ok: false, message: string }}
 */
export function resolveChannel({ flag, env, state } = {}) {
  if (flag !== undefined) return pick(flag, "flag", "--channel");
  if (env) return pick(env, "env", "MARSAI_CHANNEL");
  if (CHANNELS.includes(state))
    return { ok: true, channel: state, origin: "state" };
  return { ok: true, channel: DEFAULT_CHANNEL, origin: "default" };
}
