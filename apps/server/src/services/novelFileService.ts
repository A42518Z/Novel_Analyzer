import fs from "node:fs/promises";
import path from "node:path";
import type { NovelFile } from "@novel-analyzer/core";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");
const NOVEL_DIR = path.resolve(PROJECT_ROOT, "data", "novels");

function normalizeRelative(filePath: string): string {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");
}

export function getNovelDir(): string {
  return NOVEL_DIR;
}

export function resolveNovelPath(relativePath: string): string {
  const absolutePath = path.resolve(PROJECT_ROOT, relativePath);
  if (!absolutePath.startsWith(NOVEL_DIR)) {
    throw new Error("小说文件必须位于 data/novels 目录下");
  }
  return absolutePath;
}

export async function scanNovelFiles(): Promise<NovelFile[]> {
  await fs.mkdir(NOVEL_DIR, { recursive: true });
  const entries = await fs.readdir(NOVEL_DIR, { withFileTypes: true });
  const files: NovelFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".txt")) {
      continue;
    }

    const absolutePath = path.join(NOVEL_DIR, entry.name);
    const stat = await fs.stat(absolutePath);
    files.push({
      name: entry.name,
      relativePath: normalizeRelative(absolutePath),
      size: stat.size
    });
  }

  return files.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
}

export async function readNovelText(relativePath: string): Promise<string> {
  const absolutePath = resolveNovelPath(relativePath);
  return fs.readFile(absolutePath, "utf8");
}
