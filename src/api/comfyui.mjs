import { getSetting } from "../utils/settings.mjs";

export class ComfyUIProvider {
  async generate(prompt, options = {}) {
    const baseUrl = getSetting("comfyuiUrl") || "http://localhost:8188";
    const width = options.width || 1280;
    const height = options.height || 960;

    // Build Flux.1 Dev + RPGmap DoRA workflow
    const workflow = this._buildWorkflow(prompt, width, height);

    // Queue the prompt
    const queueResponse = await fetch(`${baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!queueResponse.ok) {
      throw new Error(`ComfyUI error (${queueResponse.status}): Failed to queue prompt`);
    }

    const { prompt_id } = await queueResponse.json();

    // Poll for completion
    const result = await this._waitForCompletion(baseUrl, prompt_id);

    // Fetch the generated image
    const imageResponse = await fetch(
      `${baseUrl}/view?filename=${result.filename}&subfolder=${result.subfolder}&type=${result.type}`
    );

    if (!imageResponse.ok) {
      throw new Error("ComfyUI error: Failed to retrieve generated image");
    }

    return imageResponse.blob();
  }

  _buildWorkflow(prompt, width, height) {
    const fluxCheckpoint = getSetting("fluxCheckpoint") || "flux1-dev.safetensors";
    const doraName = getSetting("doraName") || "rpg_maps_dora_v5.safetensors";
    const fullPrompt = `RPGmap, top down view, 2d, flat, orthographic projection, directly overhead, no perspective, ${prompt}`;

    return {
      // Flux.1 Dev base model
      "1": {
        class_type: "CheckpointLoaderSimple",
        inputs: {
          ckpt_name: fluxCheckpoint,
        },
      },
      // RPGmap DoRA — strength 0.7 per author recommendation
      "2": {
        class_type: "LoraLoader",
        inputs: {
          model: ["1", 0],
          clip: ["1", 1],
          lora_name: doraName,
          strength_model: 0.7,
          strength_clip: 0.7,
        },
      },
      // Positive prompt with RPGmap trigger word
      "3": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: fullPrompt,
          clip: ["2", 1],
        },
      },
      // Empty negative — Flux doesn't use classifier-free guidance
      "4": {
        class_type: "CLIPTextEncode",
        inputs: {
          text: "",
          clip: ["2", 1],
        },
      },
      "5": {
        class_type: "EmptyLatentImage",
        inputs: {
          width: width,
          height: height,
          batch_size: 1,
        },
      },
      // euler + simple scheduler is correct for Flux.1 Dev; CFG 1.0
      "6": {
        class_type: "KSampler",
        inputs: {
          seed: Math.floor(Math.random() * 2 ** 32),
          steps: 20,
          cfg: 1.0,
          sampler_name: "euler",
          scheduler: "simple",
          denoise: 1.0,
          model: ["2", 0],
          positive: ["3", 0],
          negative: ["4", 0],
          latent_image: ["5", 0],
        },
      },
      "7": {
        class_type: "VAEDecode",
        inputs: {
          samples: ["6", 0],
          vae: ["1", 2],
        },
      },
      "8": {
        class_type: "SaveImage",
        inputs: {
          filename_prefix: "mercator",
          images: ["7", 0],
        },
      },
    };
  }

  async _waitForCompletion(baseUrl, promptId, timeoutMs = 600000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const response = await fetch(`${baseUrl}/history/${promptId}`);
      if (!response.ok) {
        await this._sleep(2000);
        continue;
      }

      const history = await response.json();
      const entry = history[promptId];

      if (entry?.outputs) {
        for (const output of Object.values(entry.outputs)) {
          if (output.images?.length > 0) {
            return output.images[0];
          }
        }
      }

      await this._sleep(2000);
    }

    throw new Error("ComfyUI error: Image generation timed out after 10 minutes");
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
