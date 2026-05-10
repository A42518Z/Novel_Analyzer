import path from "node:path";
import { Router } from "express";
import { buildAnalysisReport } from "@novel-analyzer/core";
import { readNovelText, scanNovelFiles } from "../services/novelFileService.js";
import { saveJsonReport } from "../services/reportService.js";

export const novelsRouter = Router();

novelsRouter.get("/", async (_req, res, next) => {
  try {
    const files = await scanNovelFiles();
    res.json({ files });
  } catch (error) {
    next(error);
  }
});

novelsRouter.post("/analyze", async (req, res, next) => {
  try {
    const relativePath = String(req.body?.relativePath ?? "");
    if (!relativePath) {
      res.status(400).json({ error: "relativePath is required" });
      return;
    }

    const text = await readNovelText(relativePath);
    const report = buildAnalysisReport({
      fileName: path.basename(relativePath),
      relativePath,
      text
    });
    const saved = await saveJsonReport(report);

    res.json({ report, saved });
  } catch (error) {
    next(error);
  }
});
