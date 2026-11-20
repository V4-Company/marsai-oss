export const reviewBot = {
  title: 'The review bot: plug in yours',
  paragraphs: [
    'The flow expects **a review bot** on every pull request: an automated reviewer that reads the change, flags problems and gives a score from 1 to 5. The six-dimension rubric below is an example any bot or CI check can apply.',
    'Any good one fits: [CodeRabbit](https://www.coderabbit.ai/), [Greptile](https://www.greptile.com/), [GitHub Copilot Review](https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review), or a bot of your own. We tested CodeRabbit and Greptile, and **both are excellent** in our experience.',
    '**For smaller operations**, we recommend one of those, or a similar tool. It is the fastest way to put this review layer to work.',
    '**At V4 Company we built our own internal review bot, called Hermes**, because at our scale the per-seat tools seemed expensive. Compare the cost of a tool with the cost of building and maintaining a bot; the answer depends on your volume and your team’s capacity.',
  ],
};
