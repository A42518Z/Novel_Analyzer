const API_BASE = "http://localhost:3006/api";

export interface NovelFile {
  name: string;
  relativePath: string;
  size: number;
}

export interface AnalysisReport {
  novel: { fileName: string; relativePath: string; totalWordCount: number; chapterCount: number };
  chapters: Array<{ index: number; title: string; wordCount: number }>;
  metrics: {
    totalWordCount: number;
    chapterCount: number;
    averageChapterLength: number;
    longestChapter: { index: number; title: string; wordCount: number } | null;
    shortestChapter: { index: number; title: string; wordCount: number } | null;
    chapterLengthVariance: number;
    openingDensity: number;
  };
  analysisDraft: Record<string, string>;
  chartData: { chapterLengths: Array<{ index: number; title: string; wordCount: number }> };
  chatgptPrompts: Record<string, string>;
  generatedAt: string;
}

export type AnalysisDimension = "full" | "plot" | "character" | "technique" | "chapterValue" | "market" | "outline";

export interface DeepAnalysisReport {
  novel: { fileName: string; relativePath: string };
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  totalChunks: number;
  targetGroupWordCount: number;
  results: Array<{
    chunk: { index: number; startChapter: number; endChapter: number; wordCount: number; chapterTitles: string[] };
    prompt: string;
    result: string;
  }>;
  markdown: string;
  generatedAt: string;
  mode: "auto" | "manual";
}

export interface ChatHandoffPackage {
  novel: { fileName: string; relativePath: string };
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  totalChunks: number;
  targetGroupWordCount: number;
  prompts: Array<{ chunk: { index: number; startChapter: number; endChapter: number; wordCount: number; chapterTitles: string[] }; prompt: string }>;
  finalMergePrompt: string;
  generatedAt: string;
}

export type ChatAnalysisTaskStatusValue = "waiting_for_chat" | "running" | "partial" | "done" | "failed";

export interface ChatAnalysisTask {
  taskId: string;
  taskDir: string;
  novel: { fileName: string; relativePath: string };
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

export interface ChatTaskHistoryItem {
  task: ChatAnalysisTask;
  status: ChatAnalysisTaskStatus;
  hasFinalMarkdown: boolean;
}

export interface ChatAnalysisTaskResult {
  task: ChatAnalysisTask;
  status: ChatAnalysisTaskStatus;
  finalMarkdown: string | null;
  finalJson: unknown | null;
  files: string[];
}

export interface DeepAnalysisSaved {
  jsonPath: string;
  markdownPath: string;
}

export interface DeepAnalysisPayload {
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount: number;
  ai?: { apiKey?: string; baseUrl?: string; model?: string };
}

async function readError(response: Response, fallback: string): Promise<Error> {
  try {
    const data = await response.json() as { error?: string };
    return new Error(data.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function fetchNovels(): Promise<NovelFile[]> {
  const response = await fetch(`${API_BASE}/novels`);
  if (!response.ok) throw await readError(response, "读取小说列表失败");
  const data = await response.json() as { files: NovelFile[] };
  return data.files;
}

export async function analyzeNovel(relativePath: string): Promise<{ report: AnalysisReport; saved: { relativePath: string } }> {
  const response = await fetch(`${API_BASE}/novels/analyze`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ relativePath }) });
  if (!response.ok) throw await readError(response, "分析小说失败");
  return response.json();
}

export async function createChatTask(payload: DeepAnalysisPayload): Promise<ChatAnalysisTaskCreateResult> {
  const response = await fetch(`${API_BASE}/chat-tasks/create`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw await readError(response, "创建聊天分析任务失败");
  return response.json();
}

export async function fetchChatTasks(relativePath?: string): Promise<ChatTaskHistoryItem[]> {
  const query = relativePath ? `?relativePath=${encodeURIComponent(relativePath)}` : "";
  const response = await fetch(`${API_BASE}/chat-tasks${query}`);
  if (!response.ok) throw await readError(response, "读取聊天任务历史失败");
  const data = await response.json() as { tasks: ChatTaskHistoryItem[] };
  return data.tasks;
}

export async function fetchChatTaskStatus(taskId: string): Promise<ChatAnalysisTaskStatus> {
  const response = await fetch(`${API_BASE}/chat-tasks/${encodeURIComponent(taskId)}/status`);
  if (!response.ok) throw await readError(response, "读取任务状态失败");
  const data = await response.json() as { status: ChatAnalysisTaskStatus };
  return data.status;
}

export async function fetchChatTaskResult(taskId: string): Promise<ChatAnalysisTaskResult> {
  const response = await fetch(`${API_BASE}/chat-tasks/${encodeURIComponent(taskId)}/result`);
  if (!response.ok) throw await readError(response, "读取任务结果失败");
  return response.json();
}

export async function buildChatHandoff(payload: DeepAnalysisPayload): Promise<{ handoff: ChatHandoffPackage }> {
  const response = await fetch(`${API_BASE}/deep-analysis/chat-handoff`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw await readError(response, "生成聊天提示词失败");
  return response.json();
}

export async function runDeepAnalysis(payload: DeepAnalysisPayload): Promise<{ report: DeepAnalysisReport; saved: DeepAnalysisSaved }> {
  const response = await fetch(`${API_BASE}/deep-analysis/run`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw await readError(response, "深度分析失败");
  return response.json();
}

export async function saveManualDeepAnalysis(payload: DeepAnalysisPayload & { manualMarkdown: string }): Promise<{ report: DeepAnalysisReport; saved: DeepAnalysisSaved }> {
  const response = await fetch(`${API_BASE}/deep-analysis/save-manual`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw await readError(response, "保存手动分析失败");
  return response.json();
}
