import { describe, expect, it } from "vitest";
import { parseChapters } from "../chapterParser.js";

describe("parseChapters", () => {
  it("parses Chinese chapter headings", () => {
    const chapters = parseChapters("第一章 开端\n主角醒来。\n第二章 风波\n冲突出现。");

    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("第一章 开端");
    expect(chapters[1].title).toBe("第二章 风波");
  });

  it("falls back to chunks when no heading exists", () => {
    const chapters = parseChapters("没有章节标题的正文内容".repeat(20));

    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters[0].title).toContain("自动分段");
  });
});
