import fs from "node:fs/promises";
import path from "node:path";
import type { AnalysisReport } from "@novel-analyzer/core";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");
const REPORT_DIR = path.resolve(PROJECT_ROOT, "reports");

function safeReportName(fileName: string): string {
  const baseName = fileName.replace(/\.txt$/i, "").replace(/[^\p{L}\p{N}_-]+/gu, "_");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseName || "novel"}-${stamp}.json`;
}

export async function saveJsonReport(report: AnalysisReport): Promise<{ relativePath: string }> {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const fileName = safeReportName(report.novel.fileName);
  const absolutePath = path.join(REPORT_DIR, fileName);
  await fs.writeFile(absolutePath, JSON.stringify(report, null, 2), "utf8");

  return {
    relativePath: path.relative(PROJECT_ROOT, absolutePath).replace(/\\/g, "/")
  };
}
