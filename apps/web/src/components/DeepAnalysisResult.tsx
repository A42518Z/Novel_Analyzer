import type { DeepAnalysisReport } from "../api/client";

interface DeepAnalysisResultProps {
  report: DeepAnalysisReport | null;
}

export function DeepAnalysisResult({ report }: DeepAnalysisResultProps) {
  async function copyMarkdown() {
    if (!report) {
      return;
    }
    await navigator.clipboard.writeText(report.markdown);
  }

  if (!report) {
    return (
      <section className="workspacePanel resultPanel">
        <h2>深度分析结果</h2>
        <p>选择小说、章节范围和分析维度后，点击开始深度分析。结果会以 Markdown 形式显示在这里。</p>
      </section>
    );
  }

  return (
    <section className="workspacePanel resultPanel">
      <div className="cardHeader">
        <div>
          <h2>深度分析结果</h2>
          <p>生成时间：{new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <button onClick={copyMarkdown}>复制 Markdown</button>
      </div>
      <pre className="markdownPreview">{report.markdown}</pre>
    </section>
  );
}
