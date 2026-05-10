import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisReport } from "../api/client";

interface ChapterChartProps {
  report: AnalysisReport;
}

export function ChapterChart({ report }: ChapterChartProps) {
  const data = report.chartData.chapterLengths.slice(0, 80).map((chapter) => ({
    index: chapter.index,
    title: chapter.title,
    wordCount: chapter.wordCount
  }));

  return (
    <section className="card wide">
      <h2>章节节奏图</h2>
      <p>按章节字数观察节奏起伏，第一版最多展示前 80 章。</p>
      <div className="chartBox">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="wordCount" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
