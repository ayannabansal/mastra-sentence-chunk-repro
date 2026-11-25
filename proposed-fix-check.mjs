// The two functions from packages/rag/src/document/transformers/sentence.ts, with the proposed change.
const enders = ['.', '!', '?'];
function isCommonAbbreviation(word, startsSentence) {
  if (['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Sr', 'Jr'].includes(word)) return true;
  if (/^[A-Z](\.[A-Z])*$/.test(word) || /^[a-z](\.[a-z])*$/.test(word)) return true;
  if (/^[A-Z]$/.test(word)) return true;
  // A bare number is a list marker ("1. First item") only at the start of a sentence.
  if (/^\d+$/.test(word)) return startsSentence;
  if (/^[ap]\.?m$/i.test(word)) return true;
  return false;
}
function isRealSentenceBoundary(currentSentence, remainingText, ender) {
  if (!remainingText.trim()) return true;
  // Any script: an uppercase letter, or a letter from a script without case.
  if (!/^\s+[\p{Lu}\p{Lt}\p{Lo}]/u.test(remainingText)) return false;
  // Abbreviations end in a period. "Do you need 5?" is a finished sentence.
  if (ender !== '.') return true;
  const words = currentSentence.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  const previous = words[words.length - 2];
  const startsSentence = !previous || enders.some(e => previous.endsWith(e));
  return !isCommonAbbreviation(lastWord.slice(0, -1), startsSentence);
}
function detect(text, sentenceEnders = enders) {
  const out = []; let cur = '';
  for (let i = 0; i < text.length; i++) {
    cur += text[i];
    if (sentenceEnders.includes(text[i]) && isRealSentenceBoundary(cur, text.slice(i + 1), text[i])) { out.push(cur.trim()); cur = ''; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const cases = [
  ['It was built in 2020. Then it grew.', 2],
  ['Do you need 5? Yes, I do.', 2],
  ['What about vitamin C? It helps.', 2],
  ['We hit 100! Everyone cheered.', 2],
  ['Le projet est fini. Été arrive bientôt.', 2],
  ['Компания была основана давно. Она привлекла деньги позже.', 2],
  ['कंपनी की स्थापना हुई थी। बाद में उसने पैसा जुटाया।', 2, ['।']],
  // Must stay as they are today:
  ['It was built last year. Then it grew.', 2],
  ['I met Dr. Smith today. He was kind.', 2],
  ['Dr. Smith went to the U.S.A. at 3:30 a.m. on Monday. He met with Prof. Johnson at the U.N. headquarters.', 2],
  ['1. First item is here. 2. Second item is here.', 1],
  ['The total was 40. The average was 8.', 2],
  ['Version 2.5 is out. Upgrade now.', 2],
  ['J. K. Rowling wrote it. It sold well.', 2],
];
let bad = 0;
for (const [text, want, e] of cases) { const got = detect(text, e); if (got.length !== want) bad++; console.log(got.length === want ? 'ok  ' : 'BAD ', JSON.stringify(got)); }
console.log('failures:', bad);
