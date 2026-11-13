const shortWords = /(?<![\p{L}\p{N}_])(?:в|и|с|к|на|по|из|от|для|о|об|за|под|над|при|без|до|а|но|или|у|во|со|не|ни)[ \t]+(?=[«"(+~≈−-]?[\p{L}\p{N}][^\s\u00a0]{0,47}(?:[\s\u00a0]|$))/giu

/** Keep short function words with the next word, without binding long tokens. */
export function bindShortWords(text: string): string {
  // A dash never starts a line: it stays with the word before it.
  return text.replace(shortWords, word => word.trimEnd() + '\u00a0').replace(/ ([—–]) /g, '\u00a0$1 ')
}
