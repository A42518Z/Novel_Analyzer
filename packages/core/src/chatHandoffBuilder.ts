import { buildDeepAnalysisPrompt, DIMENSION_LABELS } from "./deepPromptBuilder.js";
import type { AnalysisDimension, ChatHandoffPackage, DeepAnalysisChunk } from "./types.js";

function chunkMeta(chunk: DeepAnalysisChunk) {
  return {
    index: chunk.index,
    startChapter: chunk.startChapter,
    endChapter: chunk.endChapter,
    wordCount: chunk.wordCount,
    chapterTitles: chunk.chapters.map((chapter) => `${chapter.index}. ${chapter.title}`)
  };
}

export function buildChatHandoffPackage(input: {
  fileName: string;
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount: number;
  chunks: DeepAnalysisChunk[];
}): ChatHandoffPackage {
  const prompts = input.chunks.map((chunk) => {
    const prompt = buildDeepAnalysisPrompt({
      fileName: input.fileName,
      dimension: input.dimension,
      chunk,
      totalChunks: input.chunks.length
    });

    return {
      chunk: chunkMeta(chunk),
      prompt: `请执行下面这个小说深度分析批次。你只需要输出本批分析结果，使用 Markdown。\n\n${prompt}`
    };
  });

  const finalMergePrompt = `我已经分批获得《${input.fileName}》第 ${input.startChapter}-${input.endChapter} 章的「${DIMENSION_LABELS[input.dimension]}」结果。请把我接下来粘贴的所有批次结果整合成一份最终报告。\n\n最终报告要求：\n1. 使用 Markdown。\n2. 先给出总体结论。\n3. 再分模块整合剧情、人物、节奏、写法、市场价值和问题建议。\n4. 不要简单重复每批内容，要合并同类项、去重、提炼规律。\n5. 最后给出可执行修改清单。`;

  return {
    novel: {
      fileName: input.fileName,
      relativePath: input.relativePath
    },
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    totalChunks: input.chunks.length,
    targetGroupWordCount: input.targetGroupWordCount,
    prompts,
    finalMergePrompt,
    generatedAt: new Date().toISOString()
  };
}
