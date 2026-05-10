import { Router } from "express";
import type { AnalysisDimension } from "@novel-analyzer/core";
import { createChatTask, listChatTasks, readChatTaskFiles, readChatTaskResult, readChatTaskStatus } from "../services/chatTaskService.js";

const DIMENSIONS = new Set<AnalysisDimension>(["full", "plot", "character", "technique", "chapterValue", "market", "outline"]);

function readDimension(value: unknown): AnalysisDimension {
  const dimension = String(value ?? "full") as AnalysisDimension;
  if (!DIMENSIONS.has(dimension)) {
    throw new Error("不支持的分析维度");
  }
  return dimension;
}

function readPositiveInt(value: unknown, fallback: number): number {
  const numberValue = Number(value ?? fallback);
  if (!Number.isFinite(numberValue) || numberValue < 1) {
    return fallback;
  }
  return Math.floor(numberValue);
}

export const chatTasksRouter = Router();

chatTasksRouter.get("/", async (req, res, next) => {
  try {
    const relativePath = typeof req.query.relativePath === "string" ? req.query.relativePath : undefined;
    res.json({ tasks: await listChatTasks(relativePath) });
  } catch (error) {
    next(error);
  }
});

chatTasksRouter.post("/create", async (req, res, next) => {
  try {
    const relativePath = String(req.body?.relativePath ?? "");
    if (!relativePath) {
      res.status(400).json({ error: "relativePath is required" });
      return;
    }

    const result = await createChatTask({
      relativePath,
      dimension: readDimension(req.body?.dimension),
      startChapter: readPositiveInt(req.body?.startChapter, 1),
      endChapter: readPositiveInt(req.body?.endChapter, 10),
      targetGroupWordCount: readPositiveInt(req.body?.targetGroupWordCount, 7000)
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

chatTasksRouter.get("/:taskId/status", async (req, res, next) => {
  try {
    res.json({ status: await readChatTaskStatus(req.params.taskId) });
  } catch (error) {
    next(error);
  }
});

chatTasksRouter.get("/:taskId/files", async (req, res, next) => {
  try {
    res.json({ files: await readChatTaskFiles(req.params.taskId) });
  } catch (error) {
    next(error);
  }
});

chatTasksRouter.get("/:taskId/result", async (req, res, next) => {
  try {
    res.json(await readChatTaskResult(req.params.taskId));
  } catch (error) {
    next(error);
  }
});
