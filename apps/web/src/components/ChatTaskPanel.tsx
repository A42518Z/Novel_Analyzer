import type { ChatAnalysisTaskCreateResult, ChatAnalysisTaskResult, ChatAnalysisTaskStatus, ChatTaskHistoryItem } from "../api/client";

interface ChatTaskPanelProps {
  task: ChatAnalysisTaskCreateResult | null;
  status: ChatAnalysisTaskStatus | null;
  result: ChatAnalysisTaskResult | null;
  history: ChatTaskHistoryItem[];
  onCreate: () => void;
  onRefresh: () => void;
  onOpenHistory: (taskId: string) => void;
  disabled?: boolean;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    waiting_for_chat: "等待执行",
    running: "执行中",
    partial: "部分完成",
    done: "已完成",
    failed: "失败"
  };
  return map[status] ?? status;
}

export function ChatTaskPanel({ task, status, result, history, onCreate, onRefresh, onOpenHistory, disabled }: ChatTaskPanelProps) {
  async function copyCommand() {
    if (task) {
      await navigator.clipboard.writeText(task.executeCommand);
    }
  }

  return (
    <section className="workspacePanel chatTaskPanel">
      <div className="cardHeader taskHeader">
        <div>
          <h3>聊天文件接力任务</h3>
          <p>创建任务后，到聊天里让我执行；完成后刷新即可展示结果。</p>
        </div>
        <button className="primary nowrapButton createTaskButton" onClick={onCreate} disabled={disabled}>创建聊天分析任务</button>
      </div>

      {task ? (
        <div className="taskBox">
          <div className="taskMetaGrid">
            <div><span>taskId</span><strong>{task.task.taskId}</strong></div>
            <div><span>状态</span><strong>{statusLabel(status?.status ?? task.status.status)}</strong></div>
            <div><span>章节</span><strong>{task.task.startChapter}-{task.task.endChapter}</strong></div>
            <div><span>进度</span><strong>{status?.currentBatch ?? 0}/{status?.totalBatches ?? task.task.totalBatches}</strong></div>
          </div>
          <div className="taskPath"><strong>任务目录：</strong>{task.taskDir}</div>
          <div className="commandBox">
            <strong>聊天执行指令</strong>
            <code>{task.executeCommand}</code>
            <button className="nowrapButton" onClick={copyCommand}>复制指令</button>
          </div>
          <div className="toolbarActions taskActions">
            <button className="nowrapButton" onClick={onRefresh}>刷新任务状态/结果</button>
          </div>
          <p>{status?.message ?? task.status.message}</p>
        </div>
      ) : (
        <p>还没有当前任务。创建后会显示执行指令；历史分析记录会在下方按当前小说列出。</p>
      )}

      <div className="historyBlock">
        <div className="miniHeader">
          <h3>该小说的历史分析</h3>
          <span>{history.length} 条</span>
        </div>
        {history.length === 0 ? (
          <p>暂无历史分析记录。</p>
        ) : (
          <div className="historyList">
            {history.map((item) => (
              <button className="historyItem" key={item.task.taskId} onClick={() => onOpenHistory(item.task.taskId)}>
                <span className="historyTitle">第 {item.task.startChapter}-{item.task.endChapter} 章 · {statusLabel(item.status.status)}</span>
                <span className="historySub">{item.task.dimension} · {new Date(item.task.createdAt).toLocaleString()} · {item.hasFinalMarkdown ? "有结果" : "无结果"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {result?.files?.length ? (
        <details>
          <summary>任务文件列表</summary>
          <ul className="fileList">
            {result.files.map((file) => <li key={file}>{file}</li>)}
          </ul>
        </details>
      ) : null}

      {result?.finalMarkdown ? (
        <details open>
          <summary>最终分析结果 final.md</summary>
          <pre className="markdownPreview">{result.finalMarkdown}</pre>
        </details>
      ) : null}
    </section>
  );
}
