import { useEffect, useState } from "react";
import {
  createChatTask,
  fetchChatTaskResult,
  fetchChatTasks,
  fetchChatTaskStatus,
  runDeepAnalysis,
  saveManualDeepAnalysis,
  type AnalysisDimension,
  type ChatAnalysisTaskCreateResult,
  type ChatAnalysisTaskResult,
  type ChatAnalysisTaskStatus,
  type ChatTaskHistoryItem,
  type DeepAnalysisReport,
  type NovelFile
} from "../api/client";
import { ChapterRangeSelector } from "./ChapterRangeSelector";
import { ChatTaskPanel } from "./ChatTaskPanel";
import { DeepAnalysisResult } from "./DeepAnalysisResult";
import { DimensionTabs } from "./DimensionTabs";
import { ManualAnalysisPanel } from "./ManualAnalysisPanel";
import { ProgressPanel } from "./ProgressPanel";

interface DeepAnalysisWorkspaceProps {
  novels: NovelFile[];
  selectedNovel: NovelFile | null;
  onSelectNovel: (novel: NovelFile) => void;
  onRefreshNovels: () => void;
}

function createTaskShell(result: ChatAnalysisTaskResult): ChatAnalysisTaskCreateResult {
  return {
    task: result.task,
    status: result.status,
    taskDir: result.task.taskDir,
    executeCommand: `执行聊天分析任务 ${result.task.taskDir} ${result.task.taskId}`
  };
}

export function DeepAnalysisWorkspace({ novels, selectedNovel, onSelectNovel, onRefreshNovels }: DeepAnalysisWorkspaceProps) {
  const [dimension, setDimension] = useState<AnalysisDimension>("full");
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(10);
  const [targetGroupWordCount, setTargetGroupWordCount] = useState(7000);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [manualMarkdown, setManualMarkdown] = useState("");
  const [report, setReport] = useState<DeepAnalysisReport | null>(null);
  const [chatTask, setChatTask] = useState<ChatAnalysisTaskCreateResult | null>(null);
  const [chatTaskStatus, setChatTaskStatus] = useState<ChatAnalysisTaskStatus | null>(null);
  const [chatTaskResult, setChatTaskResult] = useState<ChatAnalysisTaskResult | null>(null);
  const [chatTaskHistory, setChatTaskHistory] = useState<ChatTaskHistoryItem[]>([]);
  const [savedJsonPath, setSavedJsonPath] = useState("");
  const [savedMarkdownPath, setSavedMarkdownPath] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = loading || !selectedNovel;

  function payloadBase() {
    if (!selectedNovel) {
      throw new Error("请先选择小说");
    }

    return {
      relativePath: selectedNovel.relativePath,
      dimension,
      startChapter,
      endChapter,
      targetGroupWordCount,
      ai: {
        apiKey: apiKey.trim() || undefined,
        baseUrl: baseUrl.trim() || undefined,
        model: model.trim() || undefined
      }
    };
  }

  async function refreshHistory(relativePath = selectedNovel?.relativePath) {
    if (!relativePath) {
      setChatTaskHistory([]);
      return;
    }
    try {
      const history = await fetchChatTasks(relativePath);
      setChatTaskHistory(history);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "读取历史记录失败");
    }
  }

  async function createChatAnalysisTask() {
    setLoading(true);
    setStatus("正在创建聊天文件接力任务...");
    try {
      const result = await createChatTask(payloadBase());
      setChatTask(result);
      setChatTaskStatus(result.status);
      setChatTaskResult(null);
      await refreshHistory(result.task.novel.relativePath);
      setStatus(`聊天任务已创建：${result.task.taskId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "创建聊天任务失败");
    } finally {
      setLoading(false);
    }
  }

  async function refreshChatTask() {
    if (!chatTask) {
      return;
    }
    setLoading(true);
    setStatus("正在刷新聊天任务状态...");
    try {
      const [nextStatus, nextResult] = await Promise.all([
        fetchChatTaskStatus(chatTask.task.taskId),
        fetchChatTaskResult(chatTask.task.taskId)
      ]);
      setChatTaskStatus(nextStatus);
      setChatTaskResult(nextResult);
      await refreshHistory(chatTask.task.novel.relativePath);
      setStatus(`任务状态：${nextStatus.status}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "刷新任务失败");
    } finally {
      setLoading(false);
    }
  }

  async function openHistoryTask(taskId: string) {
    setLoading(true);
    setStatus("正在打开历史分析记录...");
    try {
      const result = await fetchChatTaskResult(taskId);
      setChatTask(createTaskShell(result));
      setChatTaskStatus(result.status);
      setChatTaskResult(result);
      setStartChapter(result.task.startChapter);
      setEndChapter(result.task.endChapter);
      setDimension(result.task.dimension);
      setTargetGroupWordCount(result.task.targetGroupWordCount);
      setStatus(`已打开历史任务：${taskId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "打开历史记录失败");
    } finally {
      setLoading(false);
    }
  }

  async function runAutoAnalysis() {
    setLoading(true);
    setStatus("正在执行 AI 深度分析，请等待当前批次完成...");
    try {
      const result = await runDeepAnalysis(payloadBase());
      setReport(result.report);
      setSavedJsonPath(result.saved.jsonPath);
      setSavedMarkdownPath(result.saved.markdownPath);
      setStatus(`分析完成，共 ${result.report.totalChunks} 个批次。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "深度分析失败");
    } finally {
      setLoading(false);
    }
  }

  async function saveManual() {
    setLoading(true);
    setStatus("正在保存手动粘贴分析结果...");
    try {
      const result = await saveManualDeepAnalysis({
        ...payloadBase(),
        manualMarkdown
      });
      setReport(result.report);
      setSavedJsonPath(result.saved.jsonPath);
      setSavedMarkdownPath(result.saved.markdownPath);
      setStatus("手动分析结果已保存。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  function cancelDisplay() {
    setStatus("已请求停止。当前版本会等待已发出的请求自然完成，不再建议继续扩大章节范围。");
  }

  useEffect(() => {
    setChatTask(null);
    setChatTaskStatus(null);
    setChatTaskResult(null);
    void refreshHistory(selectedNovel?.relativePath);
  }, [selectedNovel?.relativePath]);

  return (
    <section className="deepWorkspace">
      <aside className="workspaceSidebar">
        <section className="workspacePanel">
          <div className="cardHeader">
            <div>
              <h2>深度分析工作台</h2>
              <p>参考章节范围创建聊天任务或执行 API 分析。</p>
            </div>
            <button className="nowrapButton" onClick={onRefreshNovels} disabled={loading}>刷新</button>
          </div>
          <select
            value={selectedNovel?.relativePath ?? ""}
            disabled={loading}
            onChange={(event) => {
              const novel = novels.find((item) => item.relativePath === event.target.value);
              if (novel) {
                onSelectNovel(novel);
              }
            }}
          >
            <option value="">选择小说</option>
            {novels.map((novel) => (
              <option key={novel.relativePath} value={novel.relativePath}>{novel.name}</option>
            ))}
          </select>

          <ChapterRangeSelector
            startChapter={startChapter}
            endChapter={endChapter}
            targetGroupWordCount={targetGroupWordCount}
            disabled={loading}
            onStartChange={setStartChapter}
            onEndChange={setEndChapter}
            onTargetGroupWordCountChange={setTargetGroupWordCount}
          />
        </section>

        <section className="workspacePanel">
          <h3>AI 配置</h3>
          <p>可留空。当前推荐先用聊天文件接力任务。</p>
          <input value={apiKey} type="password" placeholder="OpenAI API Key，可选" onChange={(event) => setApiKey(event.target.value)} disabled={loading} />
          <input value={baseUrl} placeholder="Base URL，可选" onChange={(event) => setBaseUrl(event.target.value)} disabled={loading} />
          <input value={model} placeholder="模型名，可选，例如 gpt-4o-mini" onChange={(event) => setModel(event.target.value)} disabled={loading} />
        </section>

        <ProgressPanel status={status} savedJsonPath={savedJsonPath} savedMarkdownPath={savedMarkdownPath} />
        <ManualAnalysisPanel value={manualMarkdown} disabled={loading || !selectedNovel} onChange={setManualMarkdown} onSave={saveManual} />
      </aside>

      <div className="workspaceMain">
        <section className="workspaceToolbar">
          <DimensionTabs value={dimension} onChange={setDimension} disabled={loading} />
          <div className="toolbarActions">
            <button className="primary glow nowrapButton" onClick={createChatAnalysisTask} disabled={disabled}>创建聊天分析任务</button>
            <button className="primary glow nowrapButton" onClick={runAutoAnalysis} disabled={disabled}>API 深度分析</button>
            <button className="nowrapButton" onClick={cancelDisplay} disabled={!loading}>停止</button>
          </div>
        </section>
        <ChatTaskPanel
          task={chatTask}
          status={chatTaskStatus}
          result={chatTaskResult}
          history={chatTaskHistory}
          onCreate={createChatAnalysisTask}
          onRefresh={refreshChatTask}
          onOpenHistory={openHistoryTask}
          disabled={disabled}
        />
        <DeepAnalysisResult report={report} />
      </div>
    </section>
  );
}
