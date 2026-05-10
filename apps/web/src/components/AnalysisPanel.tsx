import type { AnalysisReport } from "../api/client";
import { ChapterChart } from "./ChapterChart";
import { MetricCards } from "./MetricCards";

interface AnalysisPanelProps {
  report: AnalysisReport | null;
  savedPath: string;
}

export function AnalysisPanel({ report, savedPath }: AnalysisPanelProps) {
  if (!report) {
    return (
      <section className="card placeholder">
        <h2>分析结果</h2>
        <p>选择小说并点击分析后，这里会展示指标、章节节奏图、JSON 报告和 ChatGPT 深度分析提示词。</p>
      </section>
    );
  }

  return (
    <div className="analysisStack">
      <section className="card wide">
        <div className="cardHeader">
          <div>
            <h2>{report.novel.fileName}</h2>
            <p>JSON 已导出：{savedPath}</p>
          </div>
        </div>
        <MetricCards report={report} />
      </section>

      <ChapterChart report={report} />

      <section className="card wide">
        <h2>ChatGPT 深度分析入口</h2>
        <div className="promptGrid">
          {Object.entries(report.chatgptPrompts).map(([key, value]) => (
            <details key={key}>
              <summary>{key}</summary>
              <pre>{value}</pre>
            </details>
          ))}
        </div>
      </section>

      <section className="card wide">
        <h2>JSON 报告</h2>
        <pre className="jsonBlock">{JSON.stringify(report, null, 2)}</pre>
      </section>
    </div>
  );
}
