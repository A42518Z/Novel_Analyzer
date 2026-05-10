import type { ChatHandoffPackage } from "../api/client";

interface ChatHandoffPanelProps {
  handoff: ChatHandoffPackage | null;
}

export function ChatHandoffPanel({ handoff }: ChatHandoffPanelProps) {
  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  if (!handoff) {
    return (
      <section className="workspacePanel chatHandoffPanel">
        <h3>聊天接力分析</h3>
        <p>点击“生成给 ChatGPT 的提示词”后，这里会出现分批提示词。复制后发给当前聊天中的我，我分析完后再粘回“手动粘贴保存”。</p>
      </section>
    );
  }

  return (
    <section className="workspacePanel chatHandoffPanel">
      <div className="cardHeader">
        <div>
          <h3>聊天接力分析</h3>
          <p>共 {handoff.totalChunks} 个批次。建议一次复制一个批次给我，避免消息过长。</p>
        </div>
        <button onClick={() => copyText(handoff.finalMergePrompt)}>复制整合提示词</button>
      </div>

      <div className="handoffList">
        {handoff.prompts.map((item) => (
          <details key={item.chunk.index}>
            <summary>
              批次 {item.chunk.index}/{handoff.totalChunks}：第 {item.chunk.startChapter}-{item.chunk.endChapter} 章，{item.chunk.wordCount} 字
            </summary>
            <div className="handoffActions">
              <button onClick={() => copyText(item.prompt)}>复制本批提示词</button>
            </div>
            <pre>{item.prompt}</pre>
          </details>
        ))}
      </div>
    </section>
  );
}
