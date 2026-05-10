# Novel Analyzer

本地小说分析器：读取 `data/novels` 目录中的 TXT 小说，拆分章节，计算基础文本指标，生成章节节奏图数据、JSON 报告，并提供深度分析工作台。

## 目录

- `apps/server`：本地 HTTP API 服务
- `apps/web`：React Web UI
- `packages/core`：小说解析、指标计算、深度分析 prompt 和报告生成核心逻辑
- `data/novels`：放置待分析的 TXT 小说
- `reports`：JSON / Markdown 报告输出目录
- `skills/novel-analyzer.md`：页面能力说明

## 启动

```bash
pnpm install
pnpm dev:server
pnpm dev:web
```

后端默认运行在 `http://localhost:3006`。

前端默认运行在 `http://localhost:5173`。

## AI 配置

复制 `.env.example` 为 `.env`，按需填写：

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

也可以在 Web UI 的深度分析工作台里临时输入 API Key、Base URL 和模型名。没有 API Key 时，可以使用“聊天接力分析”或“手动粘贴保存”模式。

## 使用方式

1. 将 `.txt` 小说文件放入 `data/novels`。
2. 启动后端和前端。
3. 打开 Web UI，刷新小说列表。
4. 在深度分析工作台中选择小说、章节范围和分析维度。
5. 如果要通过当前聊天中的 AI 助手分析，点击“生成给 ChatGPT 的提示词”。
6. 复制每个批次提示词，发给当前聊天中的 AI 助手。
7. 得到分析结果后，粘贴到“手动粘贴保存”，保存 JSON + Markdown。
8. 如果配置了 API Key，也可以点击“开始 API 深度分析”。
9. 基础分析区仍可点击“分析选中小说”，查看指标、章节节奏图和基础 JSON。

## 当前能力

- 扫描本地 TXT 小说
- 读取 UTF-8 文本
- 拆分章节
- 无章节标题时自动分段
- 计算总字数、章节数、平均章节长度、最长/最短章节、章节长度波动、开篇密度
- 生成基础 JSON 报告
- 选择章节范围做深度分析
- 支持分析维度：全面分析、剧情脉络、角色分析、写作技法、章节价值、市场爽点、大纲生成
- 支持聊天接力分析：生成适合复制给当前 ChatGPT 对话的分批提示词
- 支持 OpenAI 兼容接口自动分析
- 支持手动粘贴分析结果并保存
- 深度分析报告保存为 JSON + Markdown

## 后续扩展

- 章节目录误判清洗
- DOCX / EPUB 解析
- CSV / Excel / PDF 导出
- MCP tools 封装
- 报告历史管理
- 深度分析任务队列、暂停、继续和取消
- 人物关系图和市场评分雷达图
