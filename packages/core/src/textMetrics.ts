import type { Chapter, TextMetrics } from "./types.js";

function pickChapter(chapter: Chapter): Pick<Chapter, "index" | "title" | "wordCount"> {
  return {
    index: chapter.index,
    title: chapter.title,
    wordCount: chapter.wordCount
  };
}

export function calculateTextMetrics(chapters: Chapter[]): TextMetrics {
  const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const chapterCount = chapters.length;
  const averageChapterLength = chapterCount === 0 ? 0 : Math.round(totalWordCount / chapterCount);
  const longest = chapters.reduce<Chapter | null>((current, chapter) => {
    if (!current || chapter.wordCount > current.wordCount) {
      return chapter;
    }
    return current;
  }, null);
  const shortest = chapters.reduce<Chapter | null>((current, chapter) => {
    if (!current || chapter.wordCount < current.wordCount) {
      return chapter;
    }
    return current;
  }, null);
  const variance = chapterCount === 0
    ? 0
    : chapters.reduce((sum, chapter) => sum + Math.pow(chapter.wordCount - averageChapterLength, 2), 0) / chapterCount;
  const openingChapters = chapters.slice(0, 3);
  const openingDensity = openingChapters.length === 0
    ? 0
    : Math.round(openingChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0) / openingChapters.length);

  return {
    totalWordCount,
    chapterCount,
    averageChapterLength,
    longestChapter: longest ? pickChapter(longest) : null,
    shortestChapter: shortest ? pickChapter(shortest) : null,
    chapterLengthVariance: Math.round(variance),
    openingDensity
  };
}
