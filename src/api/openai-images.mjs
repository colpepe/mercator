import { getSetting } from "../utils/settings.mjs";

export class OpenAIProvider {
  async generate(prompt, options = {}) {
    const apiKey = getSetting("apiKeyOpenai");
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Go to Settings > Mercator to add your key.");
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI error (${response.status}): ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const b64 = data.data[0].b64_json;

    // Convert base64 to Blob
    const byteString = atob(b64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    return new Blob([bytes], { type: "image/png" });
  }
}
