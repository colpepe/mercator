import { getSetting } from "../utils/settings.mjs";

export class StabilityProvider {
  async generate(prompt, options = {}) {
    const apiKey = getSetting("apiKeyStability");
    if (!apiKey) {
      throw new Error("Stability AI API key not configured. Go to Settings > Mercator to add your key.");
    }

    const width = options.width || 1536;
    const height = options.height || 1024;

    // Use Stability AI's SDXL endpoint
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "png");
    formData.append("aspect_ratio", this._getAspectRatio(width, height));

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Stability AI error (${response.status}): ${error.message || response.statusText}`
      );
    }

    return response.blob();
  }

  _getAspectRatio(width, height) {
    const ratio = width / height;
    // Map to Stability's supported aspect ratios
    if (ratio > 1.6) return "16:9";
    if (ratio > 1.3) return "3:2";
    if (ratio > 1.1) return "4:3";
    if (ratio > 0.9) return "1:1";
    if (ratio > 0.7) return "3:4";
    return "2:3";
  }
}
