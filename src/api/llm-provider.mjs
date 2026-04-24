import { getSetting } from "../utils/settings.mjs";

export async function getLLMClient() {
  const provider = getSetting("llmProvider");

  switch (provider) {
    case "ollama": {
      const { OllamaClient } = await import("./ollama.mjs");
      return new OllamaClient();
    }
    case "claude": {
      const { ClaudeClient } = await import("./claude.mjs");
      return new ClaudeClient();
    }
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
