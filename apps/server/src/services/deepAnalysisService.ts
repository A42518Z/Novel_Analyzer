import path from "node:path";
import {
  buildChatHandoffPackage,
  buildDeepAnalysisMarkdown,
  buildDeepAnalysisPrompt,
  groupChaptersByWordCount,
  parseChapters,
  selectChapterRange,
  type AnalysisDimension,
  type ChatHandoffPackage,
  type DeepAnalysisChunkResult,
  type DeepAnalysisReport
} from "@novel-analyzer/core";
import { readNovelText } from "./novelFileService.js";
import { runOpenAiCompatibleChat, type AiProviderOptions } from "./aiProvider.js";

export interface RunDeepAnalysisInput {
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount?: number;
  ai?: AiProviderOptions;
}

export interface SaveManualAnalysisInput {
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  manualMarkdown: string;
  targetGroupWordCount?: number;
}

export interface ChatHandoffInput {
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount?: number;
}

function chunkMeta(result: { index: number; startChapter: number; endChapter: number; wordCount: number; chapters: Array<{ index: number; title: string }> }) {
  return {
    index: result.index,
    startChapter: result.startChapter,
    endChapter: result.endChapter,
    wordCount: result.wordCount,
    chapterTitles: result.chapters.map((chapter) => `${chapter.index}. ${chapter.title}`)
  };
}

export async function runDeepAnalysis(input: RunDeepAnalysisInput): Promise<DeepAnalysisReport> {
  const text = await readNovelText(input.relativePath);
  const chapters = parseChapters(text);
  const selected = selectChapterRange(chapters, input.startChapter, input.endChapter);
  if (selected.length === 0) {
    throw new Error("选定章节范围内没有可分析内容");
  }

  const targetGroupWordCount = input.targetGroupWordCount ?? 7000;
  const chunks = groupChaptersByWordCount(selected, targetGroupWordCount);
  const results: DeepAnalysisChunkResult[] = [];
  const fileName = path.basename(input.relativePath);

  for (const chunk of chunks) {
    const prompt = buildDeepAnalysisPrompt({
      fileName,
      dimension: input.dimension,
      chunk,
      totalChunks: chunks.length
    });
    const result = await runOpenAiCompatibleChat({
      prompt,
      apiKey: input.ai?.apiKey,
      baseUrl: input.ai?.baseUrl,
      model: input.ai?.model
    });

    results.push({
      chunk: chunkMeta(chunk),
      prompt,
      result
    });
  }

  const baseReport = {
    novel: { fileName, relativePath: input.relativePath },
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    totalChunks: chunks.length,
    targetGroupWordCount,
    results,
    generatedAt: new Date().toISOString(),
    mode: "auto" as const
  };

  return {
    ...baseReport,
    markdown: buildDeepAnalysisMarkdown(baseReport)
  };
}

export async function buildManualDeepAnalysisReport(input: SaveManualAnalysisInput): Promise<DeepAnalysisReport> {
  const text = await readNovelText(input.relativePath);
  const chapters = parseChapters(text);
  const selected = selectChapterRange(chapters, input.startChapter, input.endChapter);
  if (selected.length === 0) {
    throw new Error("选定章节范围内没有可分析内容");
  }

  const targetGroupWordCount = input.targetGroupWordCount ?? 7000;
  const chunks = groupChaptersByWordCount(selected, targetGroupWordCount);
  const fileName = path.basename(input.relativePath);
  const first = chunks[0];
  const last = chunks[chunks.length - 1];
  const results: DeepAnalysisChunkResult[] = [{
    chunk: {
      index: 1,
      startChapter: first.startChapter,
      endChapter: last.endChapter,
      wordCount: selected.reduce((sum, chapter) => sum + chapter.wordCount, 0),
      chapterTitles: selected.map((chapter) => `${chapter.index}. ${chapter.title}`)
    },
    prompt: "手动粘贴模式未保存自动 prompt。",
    result: input.manualMarkdown
  }];

  const baseReport = {
    novel: { fileName, relativePath: input.relativePath },
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    totalChunks: 1,
    targetGroupWordCount,
    results,
    generatedAt: new Date().toISOString(),
    mode: "manual" as const
  };

  return {
    ...baseReport,
    markdown: buildDeepAnalysisMarkdown(baseReport)
  };
}

export async function buildChatHandoff(input: ChatHandoffInput): Promise<ChatHandoffPackage> {
  const text = await readNovelText(input.relativePath);
  const chapters = parseChapters(text);
  const selected = selectChapterRange(chapters, input.startChapter, input.endChapter);
  if (selected.length === 0) {
    throw new Error("选定章节范围内没有可生成提示词的内容");
  }

  const targetGroupWordCount = input.targetGroupWordCount ?? 7000;
  const chunks = groupChaptersByWordCount(selected, targetGroupWordCount);
  const fileName = path.basename(input.relativePath);

  return buildChatHandoffPackage({
    fileName,
    relativePath: input.relativePath,
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    targetGroupWordCount,
    chunks
  });
}
