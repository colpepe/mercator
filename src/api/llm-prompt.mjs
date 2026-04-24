// Map size presets: pixel sizes divisible by 64 (Flux.1 requirement)
// gridSize is calculated so the grid aligns with the image dimensions
export const MAP_SIZES = {
  small:  { label: "Small (16x12)",  squares: [16, 12], pixels: [1024, 768],  gridSize: 64 },
  medium: { label: "Medium (24x18)", squares: [24, 18], pixels: [1280, 960],  gridSize: 53 },
  large:  { label: "Large (32x24)",  squares: [32, 24], pixels: [1536, 1152], gridSize: 48 },
};

export const SYSTEM_PROMPT = `You are Mercator, an AI assistant for tabletop RPG map generation. You receive a pre-built image prompt composed from structured selections (biome, layout, weather, etc.) and optional user details. Your job is to:

1. Polish the image prompt - improve descriptive quality while keeping ALL specified elements. Keep the "top-down overhead view" prefix. NEVER add perspective, height, or 3D terms. NEVER use words like "towering", "rising", "looming", "tall", "steep", "deep", "elevated", "soaring", "vaulted", "arching".
2. Describe everything as FLAT surface features seen from directly above: "stone floor with", "wooden planks showing", "dirt path across".
3. Describe objects by their footprint/outline from above, not height: "circular well opening", "rectangular table surface".
4. CRITICAL: The image must have ZERO text, letters, words, labels, or signs - absolutely no typography. Describe visual elements only by shape and color, never by written words.
5. Generate scene metadata.

Respond with ONLY valid JSON, no markdown formatting:
{
  "imagePrompt": "string - the polished image generation prompt",
  "sceneName": "string - evocative 2-4 word scene name",
  "darkness": number (0 bright daylight, 0.5 dim/dusk, 0.8 night, 1.0 pitch black),
  "description": "string - brief scene description for notes"
}

Do NOT include walls, grid dimensions, or pixel sizes - those are handled separately.`;

export function buildUserMessage(composedPrompt, style, mapSize, selections) {
  const parts = [`Art style: ${style}`];
  parts.push(`Map dimensions: ${mapSize.pixels[0]}x${mapSize.pixels[1]} pixels`);

  if (selections) {
    parts.push(`Biome: ${selections.biome}, Layout: ${selections.layout}`);
    parts.push(`Time: ${selections.timeOfDay}, Weather: ${selections.weather}`);
  }

  parts.push("");
  parts.push(`Image prompt to polish:`);
  parts.push(composedPrompt);

  return parts.join("\n");
}

export function parseResponse(text) {
  // Strip markdown code fences if present (common with local LLMs)
  const cleaned = text.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${text.substring(0, 300)}`);
  }
}
