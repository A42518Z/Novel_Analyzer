import { parseChapters } from "./chapterParser.js";
import { buildAnalysisPrompts } from "./promptBuilder.js";
import { calculateTextMetrics } from "./textMetrics.js";
import type { AnalysisReport } from "./types.js";

export function buildAnalysisReport(input: { fileName: string; relativePath: string; text: string }): AnalysisReport {
  const chapters = parseChapters(input.text);
  const metrics = calculateTextMetrics(chapters);
  const prompts = buildAnalysisPrompts(input.fileName, chapters, metrics);

  return {
    novel: {
      fileName: input.fileName,
      relativePath: input.relativePath,
      totalWordCount: metrics.totalWordCount,
      chapterCount: metrics.chapterCount
    },
    chapters: chapters.map((chapter) => ({
      index: chapter.index,
      title: chapter.title,
      wordCount: chapter.wordCount
    })),
    metrics,
    analysisDraft: {
      characterAnalysis: "等待 ChatGPT 根据 characterAnalysis prompt 生成主要人物、性格、成长弧和关系网。",
      plotAnalysis: "等待 ChatGPT 根据 plotAnalysis prompt 生成起承转合、冲突节点、高潮节点和节奏建议。",
      marketAppeal: "等待 ChatGPT 根据 marketAnalysis prompt 生成题材卖点、读者定位、爽点和市场潜力评分。",
      styleImitation: "等待 ChatGPT 根据 styleAnalysis prompt 生成风格特征和短示例片段。",
      outlineGeneration: "等待 ChatGPT 根据 outlineGeneration prompt 生成完整新小说大纲。"
    },
    chartData: {
      chapterLengths: chapters.map((chapter) => ({
        index: chapter.index,
        title: chapter.title,
        wordCount: chapter.wordCount
      }))
    },
    chatgptPrompts: prompts,
    generatedAt: new Date().toISOString()
  };
}
