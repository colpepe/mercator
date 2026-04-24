import { getSetting } from "../utils/settings.mjs";
import { SYSTEM_PROMPT, buildUserMessage, parseResponse } from "./llm-prompt.mjs";

export class ClaudeClient {
  constructor() {
    this.model = "claude-sonnet-4-5-20250929";
  }

  async refinePrompt(composedPrompt, style = "fantasy", mapSize = null, selections = null) {
    const apiKey = getSetting("apiKeyAnthropic");
    if (!apiKey) {
      throw new Error("Anthropic API key not configured. Go to Settings > Mercator to add your key.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserMessage(composedPrompt, style, mapSize, selections),
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error (${response.status}): ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return parseResponse(data.content[0].text);
  }
}
