import { describe, expect, it } from "vitest";
import { groupChaptersByWordCount, selectChapterRange } from "../chapterGrouper.js";

const chapters = [
  { index: 1, title: "第1章", content: "a", wordCount: 1000 },
  { index: 2, title: "第2章", content: "b", wordCount: 2000 },
  { index: 3, title: "第3章", content: "c", wordCount: 3000 },
  { index: 4, title: "第4章", content: "d", wordCount: 4000 }
];

describe("chapterGrouper", () => {
  it("selects chapter range", () => {
    const selected = selectChapterRange(chapters, 2, 3);
    expect(selected.map((chapter) => chapter.index)).toEqual([2, 3]);
  });

  it("groups chapters by target word count", () => {
    const groups = groupChaptersByWordCount(chapters, 5000);
    expect(groups).toHaveLength(3);
    expect(groups[0].startChapter).toBe(1);
    expect(groups[0].endChapter).toBe(2);
    expect(groups[1].startChapter).toBe(3);
  });
});
