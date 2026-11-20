import en from "./messages/en.js";
import ptBR from "./messages/pt-BR.js";

/** The languages the installer speaks. English is the default. */
export const LANGS = ["en", "pt-BR"];
export const DEFAULT_LANG = "en";
const CATALOGS = { en, "pt-BR": ptBR };

let chosen;

/** `pt`, `pt-BR` and `pt_BR.UTF-8` are Portuguese; `en…` is English; anything else is neither. */
export function normalizeLang(value) {
  if (typeof value !== "string") return undefined;
  const tag = value.trim().toLowerCase();
  if (tag.startsWith("pt")) return "pt-BR";
  if (tag.startsWith("en")) return "en";
  return undefined;
}

/**
 * The language the environment asks for: `MARSAI_LANG` when it names one, else the
 * first of `LC_ALL`, `LC_MESSAGES` and `LANG` that is set, when it starts with `pt`.
 */
export function detectLang(env = process.env) {
  const asked = normalizeLang(env.MARSAI_LANG);
  if (asked) return asked;
  const locale = [env.LC_ALL, env.LC_MESSAGES, env.LANG].find(Boolean);
  return normalizeLang(locale) ?? DEFAULT_LANG;
}

/** Fix the language for this process (`--lang`). `undefined` goes back to the environment. */
export function setLang(value) {
  chosen = value === undefined ? undefined : normalizeLang(value);
  return chosen;
}

export function currentLang() {
  return chosen ?? detectLang();
}

/** The installer text `key` in the current language, filled with `values`. */
export function t(key, values = {}) {
  const text = CATALOGS[currentLang()][key] ?? en[key];
  if (text === undefined) return key;
  return typeof text === "function" ? text(values) : text;
}

/** A manifest text is a plain string or one string per language. */
export function isLocalized(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0 &&
    Object.values(value).every(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    )
  );
}

/** Pick a manifest text for `lang`, falling back to English, then to whatever exists. */
export function localized(value, lang = currentLang()) {
  if (typeof value === "string") return value;
  if (!isLocalized(value)) return undefined;
  return value[lang] ?? value.en ?? value["pt-BR"] ?? Object.values(value)[0];
}
