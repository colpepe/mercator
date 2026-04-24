import { getSetting } from "../utils/settings.mjs";

export async function getImageProvider() {
  const providerKey = getSetting("imageProvider");

  switch (providerKey) {
    case "stability": {
      const { StabilityProvider } = await import("./stability.mjs");
      return new StabilityProvider();
    }
    case "openai": {
      const { OpenAIProvider } = await import("./openai-images.mjs");
      return new OpenAIProvider();
    }
    case "comfyui": {
      const { ComfyUIProvider } = await import("./comfyui.mjs");
      return new ComfyUIProvider();
    }
    default:
      throw new Error(`Unknown image provider: ${providerKey}`);
  }
}
