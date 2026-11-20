// These suites assert the installer's Portuguese texts, so they pin the language:
// the installer speaks English unless the environment asks for Portuguese.
// The English texts and the choice of language are tested in i18n.test.js.
process.env.MARSAI_LANG = "pt-BR";
