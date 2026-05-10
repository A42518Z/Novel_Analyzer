import { describe, expect, it } from "vitest";
import { calculateTextMetrics } from "../textMetrics.js";

const chapters = [
  { index: 1, title: "第一章", content: "abc", wordCount: 3 },
  { index: 2, title: "第二章", content: "abcdef", wordCount: 6 }
];

describe("calculateTextMetrics", () => {
  it("calculates basic metrics", () => {
    const metrics = calculateTextMetrics(chapters);

    expect(metrics.totalWordCount).toBe(9);
    expect(metrics.chapterCount).toBe(2);
    expect(metrics.averageChapterLength).toBe(5);
    expect(metrics.longestChapter?.title).toBe("第二章");
    expect(metrics.shortestChapter?.title).toBe("第一章");
  });
});
