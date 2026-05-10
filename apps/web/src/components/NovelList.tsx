import type { NovelFile } from "../api/client";

interface NovelListProps {
  novels: NovelFile[];
  selectedPath: string;
  loading: boolean;
  onRefresh: () => void;
  onSelect: (novel: NovelFile) => void;
  onAnalyze: () => void;
}

export function NovelList({ novels, selectedPath, loading, onRefresh, onSelect, onAnalyze }: NovelListProps) {
  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <h2>本地小说</h2>
          <p>把 TXT 放入 data/novels 后刷新列表。</p>
        </div>
        <button onClick={onRefresh} disabled={loading}>刷新</button>
      </div>

      <div className="novelList">
        {novels.length === 0 ? (
          <div className="empty">暂无 TXT 小说文件。</div>
        ) : novels.map((novel) => (
          <button
            key={novel.relativePath}
            className={selectedPath === novel.relativePath ? "novelItem active" : "novelItem"}
            onClick={() => onSelect(novel)}
          >
            <strong>{novel.name}</strong>
            <span>{Math.round(novel.size / 1024)} KB</span>
          </button>
        ))}
      </div>

      <button className="primary" onClick={onAnalyze} disabled={!selectedPath || loading}>
        分析选中小说
      </button>
    </section>
  );
}
