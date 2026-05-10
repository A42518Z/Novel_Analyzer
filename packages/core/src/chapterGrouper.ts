import type { Chapter, DeepAnalysisChunk } from "./types.js";

export function selectChapterRange(chapters: Chapter[], startChapter: number, endChapter: number): Chapter[] {
  const start = Math.max(1, Math.floor(startChapter));
  const end = Math.max(start, Math.floor(endChapter));
  return chapters.filter((chapter) => chapter.index >= start && chapter.index <= end);
}

export function groupChaptersByWordCount(chapters: Chapter[], targetWordCount = 7000): DeepAnalysisChunk[] {
  const chunks: DeepAnalysisChunk[] = [];
  let current: Chapter[] = [];
  let currentWordCount = 0;

  function flush(): void {
    if (current.length === 0) {
      return;
    }

    chunks.push({
      index: chunks.length + 1,
      startChapter: current[0].index,
      endChapter: current[current.length - 1].index,
      wordCount: currentWordCount,
      chapters: current
    });
    current = [];
    currentWordCount = 0;
  }

  for (const chapter of chapters) {
    if (current.length > 0 && currentWordCount + chapter.wordCount > targetWordCount) {
      flush();
    }

    current.push(chapter);
    currentWordCount += chapter.wordCount;

    if (chapter.wordCount >= targetWordCount) {
      flush();
    }
  }

  flush();
  return chunks;
}
