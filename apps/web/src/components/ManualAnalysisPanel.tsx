interface ManualAnalysisPanelProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

export function ManualAnalysisPanel({ value, disabled, onChange, onSave }: ManualAnalysisPanelProps) {
  return (
    <section className="workspacePanel manualPanel">
      <h3>手动粘贴保存</h3>
      <p>没有 API Key 时，可以把 ChatGPT 输出粘贴到这里，保存为 JSON + Markdown。</p>
      <textarea
        value={value}
        disabled={disabled}
        placeholder="粘贴 AI 深度分析结果..."
        onChange={(event) => onChange(event.target.value)}
      />
      <button className="primary" onClick={onSave} disabled={disabled || !value.trim()}>
        保存手动分析
      </button>
    </section>
  );
}
