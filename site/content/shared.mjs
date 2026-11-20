// What both editions of the site share: the languages, the routes and the
// addresses of the site and of the repository.

export const LANGS = {
  en: { htmlLang: 'en', ogLocale: 'en_US', hreflang: 'en' },
  pt: { htmlLang: 'pt-BR', ogLocale: 'pt_BR', hreflang: 'pt-BR' },
};

/** Route name -> path, per language. English lives at the root; Portuguese under /pt. */
export const ROUTES = {
  home: { en: '/', pt: '/pt' },
  manifesto: { en: '/manifesto', pt: '/pt/manifesto' },
  map: { en: '/map', pt: '/pt/mapa' },
  skills: { en: '/skills', pt: '/pt/skills' },
  example: { en: '/guide/example', pt: '/pt/guia/exemplo' },
  decide: { en: '/guide/who-decides', pt: '/pt/guia/quem-decide' },
  brakes: { en: '/guide/brakes', pt: '/pt/guia/freios' },
  decisions: { en: '/guide/decisions', pt: '/pt/guia/decisoes' },
  glossary: { en: '/reference/glossary', pt: '/pt/referencia/glossario' },
  questions: { en: '/reference/questions', pt: '/pt/referencia/duvidas' },
  fork: { en: '/make-it-yours', pt: '/pt/faca-o-seu' },
};

/** Paths the site used before it had two languages. They were all Portuguese. */
export const LEGACY_REDIRECTS = [
  { source: '/mapa', destination: '/pt/mapa' },
  { source: '/guia/:path*', destination: '/pt/guia/:path*' },
  { source: '/referencia/:path*', destination: '/pt/referencia/:path*' },
];

/** Whether the repository is public. While false, a way into it shows "soon" and an action on it is left out. */
export const REPO_OPEN = true;

export const SITE_URL = (process.env.SITE_URL || 'https://marsai.v4company.com').replace(/\/+$/, '');
