import type { AnalysisDimension } from "../api/client";

export const DIMENSIONS: Array<{ key: AnalysisDimension; label: string }> = [
  { key: "full", label: "全面分析" },
  { key: "plot", label: "剧情脉络" },
  { key: "character", label: "角色分析" },
  { key: "technique", label: "写作技法" },
  { key: "chapterValue", label: "章节价值" },
  { key: "market", label: "市场爽点" },
  { key: "outline", label: "大纲生成" }
];

interface DimensionTabsProps {
  value: AnalysisDimension;
  onChange: (value: AnalysisDimension) => void;
  disabled?: boolean;
}

export function DimensionTabs({ value, onChange, disabled }: DimensionTabsProps) {
  return (
    <div className="dimensionTabs">
      {DIMENSIONS.map((dimension) => (
        <button
          key={dimension.key}
          className={value === dimension.key ? "dimensionTab active" : "dimensionTab"}
          onClick={() => onChange(dimension.key)}
          disabled={disabled}
        >
          {dimension.label}
        </button>
      ))}
    </div>
  );
}
