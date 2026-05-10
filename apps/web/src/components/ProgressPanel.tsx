interface ProgressPanelProps {
  status: string;
  savedJsonPath: string;
  savedMarkdownPath: string;
}

export function ProgressPanel({ status, savedJsonPath, savedMarkdownPath }: ProgressPanelProps) {
  return (
    <section className="workspacePanel compactPanel">
      <h3>任务状态</h3>
      <p className="statusText">{status || "等待开始深度分析"}</p>
      {savedJsonPath || savedMarkdownPath ? (
        <div className="savedPaths">
          {savedJsonPath ? <div>JSON：{savedJsonPath}</div> : null}
          {savedMarkdownPath ? <div>Markdown：{savedMarkdownPath}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
