import type { Chapter } from "./types.js";

const CHAPTER_HEADING_PATTERN = /^(\s*(第\s*[0-9零一二三四五六七八九十百千万]+\s*[章节回卷部篇].*|Chapter\s+\d+.*))$/gim;
const FALLBACK_CHUNK_SIZE = 4000;

function countWords(text: string): number {
  return text.replace(/\s+/g, "").length;
}

function makeFallbackChapters(text: string): Chapter[] {
  const cleanText = text.trim();
  if (!cleanText) {
    return [];
  }

  const chapters: Chapter[] = [];
  for (let offset = 0; offset < cleanText.length; offset += FALLBACK_CHUNK_SIZE) {
    const content = cleanText.slice(offset, offset + FALLBACK_CHUNK_SIZE).trim();
    if (content) {
      chapters.push({
        index: chapters.length + 1,
        title: `自动分段 ${chapters.length + 1}`,
        content,
        wordCount: countWords(content)
      });
    }
  }
  return chapters;
}


export function parseChapters(text: string): Chapter[] {
  const source = text.replace(/\r\n/g, "\n");
  const matches = Array.from(source.matchAll(CHAPTER_HEADING_PATTERN));

  if (matches.length === 0) {
    return makeFallbackChapters(source);
  }

  const chapters: Chapter[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const title = current[1].trim();
    const start = current.index ?? 0;
    const end = next?.index ?? source.length;
    const block = source.slice(start, end).trim();
    const content = block.replace(current[0], "").trim();

    chapters.push({
      index: i + 1,
      title,
      content,
      wordCount: countWords(content)
    });
  }

  return chapters.filter((chapter) => chapter.content.length > 0);
}
