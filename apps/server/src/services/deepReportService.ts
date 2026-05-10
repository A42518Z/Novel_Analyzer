import fs from "node:fs/promises";
import path from "node:path";
import type { DeepAnalysisReport, DeepAnalysisSaveResult } from "@novel-analyzer/core";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");
const REPORT_DIR = path.resolve(PROJECT_ROOT, "reports");

function safeName(value: string): string {
  return value.replace(/\.txt$/i, "").replace(/[^\p{L}\p{N}_-]+/gu, "_") || "novel";
}

export async function saveDeepAnalysisReport(report: DeepAnalysisReport): Promise<DeepAnalysisSaveResult> {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `${safeName(report.novel.fileName)}-${report.dimension}-${report.startChapter}-${report.endChapter}-deep-analysis-${stamp}`;
  const jsonPath = path.join(REPORT_DIR, `${baseName}.json`);
  const markdownPath = path.join(REPORT_DIR, `${baseName}.md`);

  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await fs.writeFile(markdownPath, report.markdown, "utf8");

  return {
    jsonPath: path.relative(PROJECT_ROOT, jsonPath).replace(/\\/g, "/"),
    markdownPath: path.relative(PROJECT_ROOT, markdownPath).replace(/\\/g, "/")
  };
}
