export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export const splitTextIntoChunks = (
  text: string,
  options: ChunkOptions = {}
): string[] => {
  const chunkSize = options.chunkSize || 300;
  const chunkOverlap = options.chunkOverlap || 50;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.replace(/\r\n/g, '\n').trim();

  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= cleanText.length) {
      chunks.push(cleanText.substring(startIndex).trim());
      break;
    }

    // Try to find natural break boundary (newline or period)
    const nextNewline = cleanText.lastIndexOf('\n', endIndex);
    const nextPeriod = cleanText.lastIndexOf('. ', endIndex);
    const nextSpace = cleanText.lastIndexOf(' ', endIndex);

    if (nextNewline > startIndex + chunkOverlap) {
      endIndex = nextNewline;
    } else if (nextPeriod > startIndex + chunkOverlap) {
      endIndex = nextPeriod + 1;
    } else if (nextSpace > startIndex + chunkOverlap) {
      endIndex = nextSpace;
    }

    const chunk = cleanText.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = Math.max(endIndex - chunkOverlap, startIndex + 1);
  }

  return chunks;
};
