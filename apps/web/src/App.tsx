import { useEffect, useState } from "react";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { DeepAnalysisWorkspace } from "./components/DeepAnalysisWorkspace";
import { NovelList } from "./components/NovelList";
import { analyzeNovel, fetchNovels, type AnalysisReport, type NovelFile } from "./api/client";

export function App() {
  const [novels, setNovels] = useState<NovelFile[]>([]);
  const [selected, setSelected] = useState<NovelFile | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [savedPath, setSavedPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshNovels() {
    setLoading(true);
    setError("");
    try {
      const list = await fetchNovels();
      setNovels(list);
      if (!selected && list.length > 0) {
        setSelected(list[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "刷新失败");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (!selected) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await analyzeNovel(selected.relativePath);
      setReport(result.report);
      setSavedPath(result.saved.relativePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshNovels();
  }, []);

  return (
    <main className="appShell">
      <header className="hero">
        <div>
          <span className="eyebrow">Novel Analyzer</span>
          <h1>小说深度分析工作台</h1>
          <p>读取 data/novels 中的 TXT 小说，支持基础结构分析、章节范围深度分析、AI 自动分析和手动粘贴保存。</p>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <DeepAnalysisWorkspace
        novels={novels}
        selectedNovel={selected}
        onSelectNovel={setSelected}
        onRefreshNovels={refreshNovels}
      />

      <div className="layout secondaryLayout">
        <NovelList
          novels={novels}
          selectedPath={selected?.relativePath ?? ""}
          loading={loading}
          onRefresh={refreshNovels}
          onSelect={setSelected}
          onAnalyze={runAnalysis}
        />
        <AnalysisPanel report={report} savedPath={savedPath} />
      </div>
    </main>
  );
}
