import { describe, expect, it } from "vitest";
import { buildChatAnalysisTask } from "../chatTaskBuilder.js";

const chunks = [
  {
    index: 1,
    startChapter: 1,
    endChapter: 2,
    wordCount: 3000,
    chapters: [
      { index: 1, title: "第1章", content: "开端", wordCount: 1000 },
      { index: 2, title: "第2章", content: "发展", wordCount: 2000 }
    ]
  }
];

describe("buildChatAnalysisTask", () => {
  it("builds task files and waiting status", () => {
    const result = buildChatAnalysisTask({
      fileName: "demo.txt",
      relativePath: "data/novels/demo.txt",
      dimension: "full",
      startChapter: 1,
      endChapter: 2,
      targetGroupWordCount: 7000,
      chunks,
      taskId: "task-demo",
      now: new Date("2026-01-01T00:00:00.000Z")
    });

    expect(result.task.taskId).toBe("task-demo");
    expect(result.status.status).toBe("waiting_for_chat");
    expect(result.promptContents).toHaveLength(1);
    expect(result.finalMergeContent).toContain("整合");
    expect(result.executeCommand).toContain("执行聊天分析任务 reports/chat-tasks/task-demo task-demo");
  });
});
