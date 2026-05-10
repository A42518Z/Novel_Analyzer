import "dotenv/config";
import cors from "cors";
import express from "express";
import { chatTasksRouter } from "./routes/chatTasks.js";
import { deepAnalysisRouter } from "./routes/deepAnalysis.js";
import { healthRouter } from "./routes/health.js";
import { novelsRouter } from "./routes/novels.js";

const app = express();
const port = Number(process.env.PORT ?? 3006);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/health", healthRouter);
app.use("/api/novels", novelsRouter);
app.use("/api/deep-analysis", deepAnalysisRouter);
app.use("/api/chat-tasks", chatTasksRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`Novel Analyzer server listening on http://localhost:${port}`);
});
