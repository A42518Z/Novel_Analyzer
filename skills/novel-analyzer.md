# novel-analyzer

## 能力描述

小说分析器 Web 页面用于读取本地 `data/novels` 目录中的 TXT 小说，生成基础文本指标、章节节奏图数据、JSON 报告，并提供深度分析工作台。深度分析工作台支持 OpenAI 兼容接口自动分析、手动粘贴保存，以及聊天文件接力分析模式。页面会按小说关联并展示历史聊天分析任务，用户下次进入或切换小说时可以直接看到对应章节范围的历史分析记录。

## 页面入口

- Web UI：`apps/web/src/App.tsx`
- 深度分析工作台：`apps/web/src/components/DeepAnalysisWorkspace.tsx`
- 聊天任务面板：`apps/web/src/components/ChatTaskPanel.tsx`
- 本地开发地址：`http://localhost:5173`

## 后端入口

- 服务入口：`apps/server/src/index.ts`
- API 基础地址：`http://localhost:3006/api`

## 使用到的数据或接口

- `GET /api/health`：健康检查
- `GET /api/novels`：扫描 `data/novels` 下的 TXT 小说
- `POST /api/novels/analyze`：读取指定 TXT，生成基础分析报告并导出 JSON
- `GET /api/chat-tasks?relativePath=<path>`：按小说路径读取聊天分析历史任务
- `POST /api/chat-tasks/create`：创建聊天文件接力任务
- `GET /api/chat-tasks/:taskId/status`：读取聊天任务状态
- `GET /api/chat-tasks/:taskId/files`：读取聊天任务文件列表
- `GET /api/chat-tasks/:taskId/result`：读取聊天任务最终结果
- `POST /api/deep-analysis/run`：按章节范围和分析维度执行 AI 深度分析，保存 JSON + Markdown
- `POST /api/deep-analysis/save-manual`：保存用户手动粘贴的 AI 分析结果，保存 JSON + Markdown

## 聊天文件接力流程

1. 在页面选择小说、章节范围和分析维度。
2. 点击“创建聊天分析任务”。
3. 后端生成 `reports/chat-tasks/<taskId>/`，包含 `task.json`、`status.json`、`prompts/*.md`。
4. 页面显示任务目录、taskId 和可复制指令。
5. 用户在聊天中发送：`执行聊天分析任务 <任务目录路径> <taskId>`。
6. 聊天中的 AI 读取任务目录，分析所有 `prompts/batch-*.md`，写入 `results/batch-*.md`。
7. 聊天中的 AI 生成 `final.md`、`final.json`，更新 `status.json` 为 `done`。
8. 页面刷新任务状态后展示最终结果。
9. 用户下次进入页面或切换到同一本小说时，历史分析区会展示该小说之前的分析记录。

## 深度分析维度

- `full`：全面分析
- `plot`：剧情脉络
- `character`：角色分析
- `technique`：写作技法
- `chapterValue`：章节价值
- `market`：市场爽点分析
- `outline`：大纲生成

## 输入格式

- 小说文件：UTF-8 TXT
- 默认目录：`data/novels`
- 聊天任务请求：`{ "relativePath": "data/novels/example.txt", "dimension": "full", "startChapter": 1, "endChapter": 10, "targetGroupWordCount": 7000 }`
- 历史任务查询：`GET /api/chat-tasks?relativePath=data/novels/example.txt`
- 聊天执行指令：`执行聊天分析任务 reports/chat-tasks/<taskId> <taskId>`

## 输出格式

- Web UI 指标卡片
- 章节节奏图数据
- 基础 JSON 报告
- 聊天任务目录和状态
- 按小说关联的历史分析记录
- 聊天任务最终 Markdown 展示
- `results/batch-*.md`
- `final.md`
- `final.json`
- `status.json`

## 当前边界

- 当前只支持 TXT
- 聊天文件接力任务需要用户在聊天中显式让 AI 执行
- 页面不会自己执行 prompts，只负责创建任务、展示历史记录和展示文件结果
- 自动深度分析依赖 OpenAI 兼容接口
- 深度分析仍依赖当前章节解析结果，目录误判清洗将在后续单独优化

## 后续可复用方向

- 封装为 MCP tools：`create_chat_task`、`list_chat_tasks`、`read_chat_task`、`write_chat_task_result`
- 扩展 DOCX、EPUB 解析
- 扩展自动轮询和报告历史管理
- 扩展任务队列、暂停、继续和取消
