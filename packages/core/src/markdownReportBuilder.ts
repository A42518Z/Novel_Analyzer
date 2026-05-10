import { DIMENSION_LABELS } from "./deepPromptBuilder.js";
import type { DeepAnalysisReport } from "./types.js";

export function buildDeepAnalysisMarkdown(report: Omit<DeepAnalysisReport, "markdown">): string {
  const lines: string[] = [];
  lines.push(`# ${report.novel.fileName} 深度分析`);
  lines.push("");
  lines.push(`- 分析维度：${DIMENSION_LABELS[report.dimension]}`);
  lines.push(`- 章节范围：第 ${report.startChapter} 章 - 第 ${report.endChapter} 章`);
  lines.push(`- 分析批次：${report.totalChunks}`);
  lines.push(`- 分组目标字数：${report.targetGroupWordCount}`);
  lines.push(`- 生成方式：${report.mode === "auto" ? "AI 自动分析" : "手动粘贴保存"}`);
  lines.push(`- 生成时间：${report.generatedAt}`);
  lines.push("");

  for (const item of report.results) {
    lines.push(`## 批次 ${item.chunk.index}/${report.totalChunks}：第 ${item.chunk.startChapter} 章 - 第 ${item.chunk.endChapter} 章`);
    lines.push("");
    lines.push(`- 本批字数：${item.chunk.wordCount}`);
    lines.push("- 章节列表：");
    for (const title of item.chunk.chapterTitles) {
      lines.push(`  - ${title}`);
    }
    lines.push("");
    lines.push(item.result.trim());
    lines.push("");
  }

  return lines.join("\n");
}
