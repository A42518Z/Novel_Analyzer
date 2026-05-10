export interface NovelFile {
  name: string;
  relativePath: string;
  size: number;
}

export interface Chapter {
  index: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface TextMetrics {
  totalWordCount: number;
  chapterCount: number;
  averageChapterLength: number;
  longestChapter: Pick<Chapter, "index" | "title" | "wordCount"> | null;
  shortestChapter: Pick<Chapter, "index" | "title" | "wordCount"> | null;
  chapterLengthVariance: number;
  openingDensity: number;
}

export interface AnalysisPromptSet {
  characterAnalysis: string;
  plotAnalysis: string;
  marketAnalysis: string;
  styleAnalysis: string;
  outlineGeneration: string;
}

export interface AnalysisReport {
  novel: {
    fileName: string;
    relativePath: string;
    totalWordCount: number;
    chapterCount: number;
  };
  chapters: Array<Pick<Chapter, "index" | "title" | "wordCount">>;
  metrics: TextMetrics;
  analysisDraft: {
    characterAnalysis: string;
    plotAnalysis: string;
    marketAppeal: string;
    styleImitation: string;
    outlineGeneration: string;
  };
  chartData: {
    chapterLengths: Array<{ index: number; title: string; wordCount: number }>;
  };
  chatgptPrompts: AnalysisPromptSet;
  generatedAt: string;
}

export type AnalysisDimension =
  | "full"
  | "plot"
  | "character"
  | "technique"
  | "chapterValue"
  | "market"
  | "outline";

export interface DeepAnalysisRequest {
  fileName: string;
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount?: number;
}

export interface DeepAnalysisChunk {
  index: number;
  startChapter: number;
  endChapter: number;
  wordCount: number;
  chapters: Chapter[];
}

export interface DeepAnalysisChunkResult {
  chunk: Omit<DeepAnalysisChunk, "chapters"> & {
    chapterTitles: string[];
  };
  prompt: string;
  result: string;
}

export interface DeepAnalysisReport {
  novel: {
    fileName: string;
    relativePath: string;
  };
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  totalChunks: number;
  targetGroupWordCount: number;
  results: DeepAnalysisChunkResult[];
  markdown: string;
  generatedAt: string;
  mode: "auto" | "manual";
}

export interface DeepAnalysisSaveResult {
  jsonPath: string;
  markdownPath: string;
}

export interface ChatHandoffPrompt {
  chunk: Omit<DeepAnalysisChunk, "chapters"> & {
    chapterTitles: string[];
  };
  prompt: string;
}

export interface ChatHandoffPackage {
  novel: {
    fileName: string;
    relativePath: string;
  };
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  totalChunks: number;
  targetGroupWordCount: number;
  prompts: ChatHandoffPrompt[];
  finalMergePrompt: string;
  generatedAt: string;
}

export type ChatAnalysisTaskStatusValue = "waiting_for_chat" | "running" | "partial" | "done" | "failed";

export interface ChatAnalysisTask {
  taskId: string;
  taskDir: string;
  novel: {
    fileName: string;
    relativePath: string;
  };
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  totalBatches: number;
  targetGroupWordCount: number;
  createdAt: string;
  promptFiles: string[];
  resultFiles: string[];
  finalMergePromptFile: string;
}

export interface ChatAnalysisTaskStatus {
  taskId: string;
  status: ChatAnalysisTaskStatusValue;
  currentBatch: number;
  totalBatches: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
  error: string | null;
}

export interface ChatAnalysisTaskCreateResult {
  task: ChatAnalysisTask;
  status: ChatAnalysisTaskStatus;
  taskDir: string;
  executeCommand: string;
}

export interface ChatAnalysisTaskResult {
  task: ChatAnalysisTask;
  status: ChatAnalysisTaskStatus;
  finalMarkdown: string | null;
  finalJson: unknown | null;
  files: string[];
}
