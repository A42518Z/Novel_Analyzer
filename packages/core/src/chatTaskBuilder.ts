import { buildChatHandoffPackage } from "./chatHandoffBuilder.js";
import type {
  AnalysisDimension,
  ChatAnalysisTask,
  ChatAnalysisTaskCreateResult,
  ChatAnalysisTaskStatus,
  DeepAnalysisChunk
} from "./types.js";

function padBatch(index: number): string {
  return String(index).padStart(3, "0");
}

function makeTaskId(fileName: string, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const safeName = fileName.replace(/\.txt$/i, "").replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 24) || "novel";
  return `${stamp}-${safeName}`;
}

export function buildChatAnalysisTask(input: {
  fileName: string;
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount: number;
  chunks: DeepAnalysisChunk[];
  taskId?: string;
  now?: Date;
}): ChatAnalysisTaskCreateResult & { promptContents: Array<{ path: string; content: string }>; finalMergeContent: string } {
  const now = input.now ?? new Date();
  const createdAt = now.toISOString();
  const taskId = input.taskId ?? makeTaskId(input.fileName, now);
  const taskDir = `reports/chat-tasks/${taskId}`;
  const handoff = buildChatHandoffPackage({
    fileName: input.fileName,
    relativePath: input.relativePath,
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    targetGroupWordCount: input.targetGroupWordCount,
    chunks: input.chunks
  });
  const promptContents = handoff.prompts.map((prompt, index) => ({
    path: `prompts/batch-${padBatch(index + 1)}.md`,
    content: prompt.prompt
  }));
  const promptFiles = promptContents.map((item) => `${taskDir}/${item.path}`);
  const resultFiles = promptContents.map((_item, index) => `${taskDir}/results/batch-${padBatch(index + 1)}.md`);
  const finalMergePromptFile = `${taskDir}/prompts/final-merge.md`;

  const task: ChatAnalysisTask = {
    taskId,
    taskDir,
    novel: {
      fileName: input.fileName,
      relativePath: input.relativePath
    },
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    totalBatches: input.chunks.length,
    targetGroupWordCount: input.targetGroupWordCount,
    createdAt,
    promptFiles,
    resultFiles,
    finalMergePromptFile
  };

  const status: ChatAnalysisTaskStatus = {
    taskId,
    status: "waiting_for_chat",
    currentBatch: 0,
    totalBatches: input.chunks.length,
    message: `任务已创建，请在聊天中发送：执行聊天分析任务 ${taskDir} ${taskId}`,
    createdAt,
    updatedAt: createdAt,
    finishedAt: null,
    error: null
  };

  return {
    task,
    status,
    taskDir,
    executeCommand: `执行聊天分析任务 ${taskDir} ${taskId}`,
    promptContents,
    finalMergeContent: handoff.finalMergePrompt
  };
}
