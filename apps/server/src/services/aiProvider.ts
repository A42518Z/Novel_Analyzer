export interface AiProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AiProviderRequest extends AiProviderOptions {
  prompt: string;
}

function readConfig(options: AiProviderOptions): Required<AiProviderOptions> {
  return {
    apiKey: options.apiKey || process.env.OPENAI_API_KEY || "",
    baseUrl: options.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: options.model || process.env.OPENAI_MODEL || "gpt-4o-mini"
  };
}

export async function runOpenAiCompatibleChat(request: AiProviderRequest): Promise<string> {
  const config = readConfig(request);
  if (!config.apiKey) {
    throw new Error("未配置 OPENAI_API_KEY。请在 .env 中配置，或在页面临时输入 API Key；也可以使用手动粘贴保存模式。");
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: "你是专业网文编辑、小说分析师和商业化创作顾问。" },
        { role: "user", content: request.prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI 调用失败：${response.status} ${text.slice(0, 500)}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI 返回结果为空");
  }

  return content;
}
