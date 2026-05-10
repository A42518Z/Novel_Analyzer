import type { AnalysisDimension, DeepAnalysisChunk } from "./types.js";

export const DIMENSION_LABELS: Record<AnalysisDimension, string> = {
  full: "全面分析",
  plot: "剧情脉络",
  character: "角色分析",
  technique: "写作技法",
  chapterValue: "章节价值",
  market: "市场爽点分析",
  outline: "大纲生成"
};

function dimensionInstruction(dimension: AnalysisDimension): string {
  switch (dimension) {
    case "plot":
      return "重点分析剧情脉络、冲突推进、转折节点、悬念设置、节奏问题，并给出章节级优化建议。";
    case "character":
      return "重点分析主要角色、人物关系、性格标签、成长弧、动机变化、角色冲突和可强化之处。";
    case "technique":
      return "重点分析写作技法，包括叙事视角、对话、场景调度、信息差、伏笔、爽点释放和语言风格。";
    case "chapterValue":
      return "重点判断每章的功能价值，包括推进剧情、塑造人物、释放爽点、铺设伏笔、世界观展开和可能冗余。";
    case "market":
      return "重点分析市场吸引力、读者爽点、开篇钩子、题材卖点、潜在流失点、平台适配度和爆款共性匹配。";
    case "outline":
      return "请基于这些章节反推作品结构，并生成一份新小说大纲，包含题材定位、核心卖点、主角、配角、反派、分卷设计和前10章细纲。";
    case "full":
    default:
      return "请做全面分析，覆盖剧情、人物、节奏、写作技法、市场爽点、问题诊断和可执行优化建议。";
  }
}

function chunkText(chunk: DeepAnalysisChunk): string {
  return chunk.chapters
    .map((chapter) => `## ${chapter.title}\n字数：${chapter.wordCount}\n${chapter.content}`)
    .join("\n\n---\n\n");
}

export function buildDeepAnalysisPrompt(input: {
  fileName: string;
  dimension: AnalysisDimension;
  chunk: DeepAnalysisChunk;
  totalChunks: number;
}): string {
  const label = DIMENSION_LABELS[input.dimension];
  const titles = input.chunk.chapters.map((chapter) => `${chapter.index}. ${chapter.title}（${chapter.wordCount}字）`).join("\n");

  return `你是一名专业网文编辑、小说结构分析师和商业化创作顾问。请对下面小说章节进行「${label}」。

小说：${input.fileName}
分析批次：${input.chunk.index}/${input.totalChunks}
章节范围：第${input.chunk.startChapter}章 - 第${input.chunk.endChapter}章
本批字数：${input.chunk.wordCount}

分析要求：
${dimensionInstruction(input.dimension)}

输出要求：
1. 使用 Markdown。
2. 先给出本批核心结论。
3. 再分点分析，结论必须具体，不要空泛。
4. 每个判断尽量说明依据来自哪些章节或情节。
5. 最后给出可执行改进建议。

章节列表：
${titles}

章节正文：
${chunkText(input.chunk)}`;
}
