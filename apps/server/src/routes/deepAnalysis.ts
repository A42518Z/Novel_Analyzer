import { Router } from "express";
import type { AnalysisDimension } from "@novel-analyzer/core";
import { buildChatHandoff, buildManualDeepAnalysisReport, runDeepAnalysis } from "../services/deepAnalysisService.js";
import { saveDeepAnalysisReport } from "../services/deepReportService.js";

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

export const deepAnalysisRouter = Router();

deepAnalysisRouter.post("/chat-handoff", async (req, res, next) => {
  try {
    const relativePath = String(req.body?.relativePath ?? "");
    if (!relativePath) {
      res.status(400).json({ error: "relativePath is required" });
      return;
    }

    const handoff = await buildChatHandoff({
      relativePath,
      dimension: readDimension(req.body?.dimension),
      startChapter: readPositiveInt(req.body?.startChapter, 1),
      endChapter: readPositiveInt(req.body?.endChapter, 10),
      targetGroupWordCount: readPositiveInt(req.body?.targetGroupWordCount, 7000)
    });
    res.json({ handoff });
  } catch (error) {
    next(error);
  }
});

deepAnalysisRouter.post("/run", async (req, res, next) => {
  try {
    const relativePath = String(req.body?.relativePath ?? "");
    if (!relativePath) {
      res.status(400).json({ error: "relativePath is required" });
      return;
    }

    const report = await runDeepAnalysis({
      relativePath,
      dimension: readDimension(req.body?.dimension),
      startChapter: readPositiveInt(req.body?.startChapter, 1),
      endChapter: readPositiveInt(req.body?.endChapter, 10),
      targetGroupWordCount: readPositiveInt(req.body?.targetGroupWordCount, 7000),
      ai: {
        apiKey: req.body?.ai?.apiKey,
        baseUrl: req.body?.ai?.baseUrl,
        model: req.body?.ai?.model
      }
    });
    const saved = await saveDeepAnalysisReport(report);
    res.json({ report, saved });
  } catch (error) {
    next(error);
  }
});

deepAnalysisRouter.post("/save-manual", async (req, res, next) => {
  try {
    const relativePath = String(req.body?.relativePath ?? "");
    const manualMarkdown = String(req.body?.manualMarkdown ?? "").trim();
    if (!relativePath) {
      res.status(400).json({ error: "relativePath is required" });
      return;
    }
    if (!manualMarkdown) {
      res.status(400).json({ error: "manualMarkdown is required" });
      return;
    }

    const report = await buildManualDeepAnalysisReport({
      relativePath,
      manualMarkdown,
      dimension: readDimension(req.body?.dimension),
      startChapter: readPositiveInt(req.body?.startChapter, 1),
      endChapter: readPositiveInt(req.body?.endChapter, 10),
      targetGroupWordCount: readPositiveInt(req.body?.targetGroupWordCount, 7000)
    });
    const saved = await saveDeepAnalysisReport(report);
    res.json({ report, saved });
  } catch (error) {
    next(error);
  }
});
