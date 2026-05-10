import type { AnalysisReport } from "../api/client";

interface MetricCardsProps {
  report: AnalysisReport;
}

export function MetricCards({ report }: MetricCardsProps) {
  const cards = [
    { label: "总字数", value: report.metrics.totalWordCount.toLocaleString() },
    { label: "章节数", value: report.metrics.chapterCount.toLocaleString() },
    { label: "平均章节", value: report.metrics.averageChapterLength.toLocaleString() },
    { label: "开篇密度", value: report.metrics.openingDensity.toLocaleString() }
  ];

  return (
    <div className="metricGrid">
      {cards.map((card) => (
        <div className="metricCard" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </div>
      ))}
    </div>
  );
}
