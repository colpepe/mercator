import { getSetting } from "../utils/settings.mjs";
import { SYSTEM_PROMPT, buildUserMessage, parseResponse } from "./llm-prompt.mjs";

export class OllamaClient {
  async refinePrompt(composedPrompt, style = "fantasy", mapSize = null, selections = null) {
    const baseUrl = getSetting("ollamaUrl") || "http://localhost:11434";
    const model = getSetting("ollamaModel") || "llama3.1:latest";

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        stream: false,
        format: "json",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(composedPrompt, style, mapSize, selections) },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "");
      throw new Error(`Ollama error (${response.status}): ${error || response.statusText}`);
    }

    const data = await response.json();
    return parseResponse(data.message.content);
  }
}
