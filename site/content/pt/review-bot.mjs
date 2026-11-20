export const reviewBot = {
  title: 'O bot de review: conecte o seu',
  paragraphs: [
    'O fluxo espera **um bot de review** em toda pull request: um revisor automático que lê a mudança, aponta problemas e dá uma nota de 1 a 5. A rubrica de seis dimensões abaixo é um exemplo que qualquer bot ou check de CI pode aplicar.',
    'Qualquer bom bot serve: [CodeRabbit](https://www.coderabbit.ai/), [Greptile](https://www.greptile.com/), [GitHub Copilot Review](https://docs.github.com/pt/copilot/using-github-copilot/code-review/using-copilot-code-review) ou um bot próprio. Testamos o CodeRabbit e o Greptile, e **os dois são excelentes** na nossa experiência.',
    '**Para operações pequenas**, recomendamos um deles, ou uma ferramenta similar. É o jeito mais rápido de colocar essa camada de review para funcionar.',
    '**Na V4 Company, construímos o nosso próprio bot de review interno, o Hermes**, porque na nossa escala as ferramentas cobradas por usuário pareciam caras. Compare o custo de uma ferramenta com o de construir e manter um bot; a resposta depende do seu volume e da capacidade do seu time.',
  ],
};
