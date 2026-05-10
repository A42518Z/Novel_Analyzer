import type { Chapter, TextMetrics, AnalysisPromptSet } from "./types.js";

function chapterBrief(chapters: Chapter[]): string {
  return chapters
    .slice(0, 20)
    .map((chapter) => `${chapter.index}. ${chapter.title}（${chapter.wordCount}字）：${chapter.content.slice(0, 180)}`)
    .join("\n");
}

export function buildAnalysisPrompts(fileName: string, chapters: Chapter[], metrics: TextMetrics): AnalysisPromptSet {
  const brief = chapterBrief(chapters);
  const metricText = `文件：${fileName}\n总字数：${metrics.totalWordCount}\n章节数：${metrics.chapterCount}\n平均章节长度：${metrics.averageChapterLength}\n开篇密度：${metrics.openingDensity}`;

  return {
    characterAnalysis: `请基于以下小说章节摘要分析主要人物、人物关系、性格标签、成长弧和冲突关系。\n\n${metricText}\n\n章节摘要：\n${brief}`,
    plotAnalysis: `请基于以下小说章节摘要分析剧情结构，包括开篇钩子、主要冲突、转折节点、高潮节点、节奏问题和章节级优化建议。\n\n${metricText}\n\n章节摘要：\n${brief}`,
    marketAnalysis: `请基于以下小说信息分析市场吸引力，包括题材卖点、目标读者、爽点、流失点、爆款共性匹配度和可执行优化建议。\n\n${metricText}\n\n章节摘要：\n${brief}`,
    styleAnalysis: `请分析这部小说的语言风格，包括叙事视角、句式长度、对话密度、描写偏好、情绪基调，并生成一段不超过500字的风格示例片段。\n\n${metricText}\n\n章节摘要：\n${brief}`,
    outlineGeneration: `请基于这部小说的结构与市场定位，生成一份完整新小说大纲。大纲需要包含书名方向、题材定位、核心卖点、世界观、主角、配角、反派阻力、主线剧情、分卷大纲、前10章细纲、爽点安排和市场定位建议。\n\n${metricText}\n\n章节摘要：\n${brief}`
  };
}
