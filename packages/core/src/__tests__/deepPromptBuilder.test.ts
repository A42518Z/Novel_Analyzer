import { describe, expect, it } from "vitest";
import { buildDeepAnalysisPrompt } from "../deepPromptBuilder.js";

const chunk = {
  index: 1,
  startChapter: 1,
  endChapter: 1,
  wordCount: 12,
  chapters: [{ index: 1, title: "第1章 开端", content: "主角醒来。", wordCount: 12 }]
};

describe("buildDeepAnalysisPrompt", () => {
  it("builds prompt with dimension label and chapter text", () => {
    const prompt = buildDeepAnalysisPrompt({
      fileName: "demo.txt",
      dimension: "plot",
      chunk,
      totalChunks: 1
    });

    expect(prompt).toContain("剧情脉络");
    expect(prompt).toContain("第1章 开端");
    expect(prompt).toContain("主角醒来");
  });
});
