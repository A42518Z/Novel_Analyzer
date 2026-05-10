import fs from "node:fs/promises";
import path from "node:path";
import {
  buildChatAnalysisTask,
  groupChaptersByWordCount,
  parseChapters,
  selectChapterRange,
  type AnalysisDimension,
  type ChatAnalysisTask,
  type ChatAnalysisTaskCreateResult,
  type ChatAnalysisTaskResult,
  type ChatAnalysisTaskStatus
} from "@novel-analyzer/core";
import { readNovelText } from "./novelFileService.js";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");
const TASK_ROOT = path.resolve(PROJECT_ROOT, "reports", "chat-tasks");

export interface CreateChatTaskInput {
  relativePath: string;
  dimension: AnalysisDimension;
  startChapter: number;
  endChapter: number;
  targetGroupWordCount: number;
}

export interface ChatTaskHistoryItem {
  task: ChatAnalysisTask;
  status: ChatAnalysisTaskStatus;
  hasFinalMarkdown: boolean;
}

function ensureTaskId(value: string): string {
  if (!/^[\p{L}\p{N}_-]+$/u.test(value)) {
    throw new Error("taskId 格式不合法");
  }
  return value;
}

function taskAbsDir(taskId: string): string {
  const safeTaskId = ensureTaskId(taskId);
  const dir = path.resolve(TASK_ROOT, safeTaskId);
  if (!dir.startsWith(TASK_ROOT)) {
    throw new Error("任务路径不合法");
  }
  return dir;
}

function rel(filePath: string): string {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  if (!(await fileExists(dir))) {
    return [];
  }
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...await listFilesRecursive(fullPath));
    } else {
      result.push(rel(fullPath));
    }
  }
  return result.sort();
}

export async function createChatTask(input: CreateChatTaskInput): Promise<ChatAnalysisTaskCreateResult> {
  const text = await readNovelText(input.relativePath);
  const chapters = parseChapters(text);
  const selected = selectChapterRange(chapters, input.startChapter, input.endChapter);
  if (selected.length === 0) {
    throw new Error("选定章节范围内没有可创建任务的内容");
  }

  const chunks = groupChaptersByWordCount(selected, input.targetGroupWordCount);
  const fileName = path.basename(input.relativePath);
  const built = buildChatAnalysisTask({
    fileName,
    relativePath: input.relativePath,
    dimension: input.dimension,
    startChapter: input.startChapter,
    endChapter: input.endChapter,
    targetGroupWordCount: input.targetGroupWordCount,
    chunks
  });

  const dir = taskAbsDir(built.task.taskId);
  await fs.mkdir(path.join(dir, "prompts"), { recursive: true });
  await fs.mkdir(path.join(dir, "results"), { recursive: true });
  await fs.writeFile(path.join(dir, "task.json"), JSON.stringify(built.task, null, 2), "utf8");
  await fs.writeFile(path.join(dir, "status.json"), JSON.stringify(built.status, null, 2), "utf8");
  for (const prompt of built.promptContents) {
    await fs.writeFile(path.join(dir, prompt.path), prompt.content, "utf8");
  }
  await fs.writeFile(path.join(dir, "prompts", "final-merge.md"), built.finalMergeContent, "utf8");

  return {
    task: built.task,
    status: built.status,
    taskDir: built.taskDir,
    executeCommand: built.executeCommand
  };
}

export async function listChatTasks(relativePath?: string): Promise<ChatTaskHistoryItem[]> {
  await fs.mkdir(TASK_ROOT, { recursive: true });
  const entries = await fs.readdir(TASK_ROOT, { withFileTypes: true });
  const items: ChatTaskHistoryItem[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const dir = path.join(TASK_ROOT, entry.name);
    const taskPath = path.join(dir, "task.json");
    const statusPath = path.join(dir, "status.json");
    if (!(await fileExists(taskPath)) || !(await fileExists(statusPath))) {
      continue;
    }

    const task = await readJson<ChatAnalysisTask>(taskPath);
    if (relativePath && task.novel.relativePath !== relativePath) {
      continue;
    }

    items.push({
      task,
      status: await readJson<ChatAnalysisTaskStatus>(statusPath),
      hasFinalMarkdown: await fileExists(path.join(dir, "final.md"))
    });
  }

  return items.sort((a, b) => b.task.createdAt.localeCompare(a.task.createdAt));
}

export async function readChatTaskStatus(taskId: string): Promise<ChatAnalysisTaskStatus> {
  return readJson<ChatAnalysisTaskStatus>(path.join(taskAbsDir(taskId), "status.json"));
}

export async function readChatTask(taskId: string): Promise<ChatAnalysisTask> {
  return readJson<ChatAnalysisTask>(path.join(taskAbsDir(taskId), "task.json"));
}

export async function readChatTaskFiles(taskId: string): Promise<string[]> {
  return listFilesRecursive(taskAbsDir(taskId));
}

export async function readChatTaskResult(taskId: string): Promise<ChatAnalysisTaskResult> {
  const dir = taskAbsDir(taskId);
  const task = await readChatTask(taskId);
  const status = await readChatTaskStatus(taskId);
  const finalMdPath = path.join(dir, "final.md");
  const finalJsonPath = path.join(dir, "final.json");
  const finalMarkdown = await fileExists(finalMdPath) ? await fs.readFile(finalMdPath, "utf8") : null;
  const finalJson = await fileExists(finalJsonPath) ? await readJson<unknown>(finalJsonPath) : null;
  const files = await readChatTaskFiles(taskId);

  return {
    task,
    status,
    finalMarkdown,
    finalJson,
    files
  };
}
