import { MDocument } from '@mastra/rag';

// targetSize: 1 closes a chunk after every sentence, so the output shows the sentences the splitter found.
async function sentences(text, sentenceEnders) {
  const chunks = await MDocument.fromText(text).chunk({
    strategy: 'sentence', maxSize: 200, minSize: 1, targetSize: 1, overlap: 0,
    ...(sentenceEnders ? { sentenceEnders } : {}),
  });
  return chunks.map(c => c.text);
}

const cases = [
  ['works: plain sentences', 'It was built last year. Then it grew.'],
  ['sentence ends in a number', 'It was built in 2020. Then it grew.'],
  ['question ends in a number', 'Do you need 5? Yes, I do.'],
  ['question ends in a single capital letter', 'What about vitamin C? It helps.'],
  ['next sentence starts with an accented capital', 'Le projet est fini. Été arrive bientôt.'],
  ['Russian', 'Компания была основана давно. Она привлекла деньги позже.'],
  ['Hindi, with its own sentence ender', 'कंपनी की स्थापना हुई थी। बाद में उसने पैसा जुटाया।', ['।']],
];
for (const [name, text, enders] of cases) {
  const out = await sentences(text, enders);
  console.log(`${out.length} chunk(s)  ${name}\n   ${JSON.stringify(out)}`);
}

// The visible effect: with a realistic size, a chunk ends in the middle of a sentence.
const cut = await MDocument.fromText(
  'The company was founded in 2019. It raised money in 2021. It went public in 2024.',
).chunk({ strategy: 'sentence', maxSize: 60, minSize: 1, overlap: 0 });
console.log('\nmaxSize 60:\n' + cut.map(c => `   | ${c.text}`).join('\n'));
