# @mastra/rag: sentence chunking misses sentence boundaries

Reproduction for a bug report against `@mastra/rag` 2.8.2.

    npm install
    npm run repro    # shows the bug on the published package
    npm run check    # runs the proposed change against the broken cases and the ones that must not change

`repro.mjs` uses `targetSize: 1`, which closes a chunk after every sentence, so the output shows
exactly which sentences the splitter found.

`proposed-fix-check.mjs` holds a copy of the two functions involved
(`isRealSentenceBoundary` and `isCommonAbbreviation` from
`packages/rag/src/document/transformers/sentence.ts`) with the proposed change applied.
