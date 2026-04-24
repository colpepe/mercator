import { getSetting } from "../utils/settings.mjs";

const VISION_PROMPT = `You are analyzing a top-down 2D battle map for a tabletop RPG. The map has a grid of 5-foot squares.

Analyze this map image and return a JSON object with:
1. "terrain": a 2D array (rows x columns) where each element is a terrain code for that grid square:
   - "f" = floor/ground (normal traversal)
   - "w" = water (difficult terrain)
   - "o" = obstacle (blocked - large rock, tree trunk, pillar)
   - "p" = pit/hole (dangerous terrain)
   - "e" = elevated (raised platform, table)
   - "v" = vegetation (light cover, difficult terrain)
2. "additionalWalls": array of wall segments visible in the image. Each wall: {"c": [x1, y1, x2, y2], "door": 0, "ds": 0} in grid coordinates.
3. "doors": array of door positions: {"c": [x1, y1, x2, y2], "door": 1, "ds": 1}

Grid dimensions: {width}x{height} squares. Origin [0,0] is top-left. x increases right, y increases down.

Respond with ONLY valid JSON, no markdown.`;

export class VisionAnalyzer {
  async analyze(imageBlob, mapSize) {
    const baseUrl = getSetting("ollamaUrl") || "http://localhost:11434";
    const model = getSetting("visionModel") || "llama3.2-vision:latest";

    // Convert blob to base64
    const buffer = await imageBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    const prompt = VISION_PROMPT
      .replace("{width}", mapSize.squares[0])
      .replace("{height}", mapSize.squares[1]);

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [
          {
            role: "user",
            content: prompt,
            images: [base64],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "");
      throw new Error(`Vision analysis error (${response.status}): ${error || response.statusText}`);
    }

    const data = await response.json();
    return this._parseResponse(data.message.content);
  }

  _parseResponse(text) {
    const cleaned = text.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
    try {
      const result = JSON.parse(cleaned);
      return {
        terrain: result.terrain || [],
        additionalWalls: result.additionalWalls || [],
        doors: result.doors || [],
      };
    } catch {
      console.warn("Mercator | Vision response was not valid JSON, skipping terrain analysis");
      return { terrain: [], additionalWalls: [], doors: [] };
    }
  }
}
