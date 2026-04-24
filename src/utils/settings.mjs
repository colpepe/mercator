const MODULE_ID = "mercator";

export function registerSettings() {
  // Settings menu for API key configuration (GM-only)
  game.settings.registerMenu(MODULE_ID, "apiConfigMenu", {
    name: game.i18n.localize("mercator.settings.menu.name"),
    label: game.i18n.localize("mercator.settings.menu.label"),
    icon: "fas fa-key",
    type: MercatorSettingsForm,
    restricted: true,
  });

  // LLM provider selection
  game.settings.register(MODULE_ID, "llmProvider", {
    name: "LLM Provider",
    hint: "Select which LLM to use for prompt refinement.",
    scope: "world",
    config: true,
    type: String,
    default: "ollama",
    choices: {
      ollama: "Ollama (Local)",
      claude: "Claude (Anthropic)",
    },
  });

  // Ollama server URL
  game.settings.register(MODULE_ID, "ollamaUrl", {
    name: "Ollama Server URL",
    hint: "URL of your local Ollama instance.",
    scope: "world",
    config: false,
    type: String,
    default: "http://localhost:11434",
  });

  // Ollama model name
  game.settings.register(MODULE_ID, "ollamaModel", {
    name: "Ollama Model",
    hint: "Model name to use (e.g., llama3.1:8b, mistral, etc.).",
    scope: "world",
    config: false,
    type: String,
    default: "llama3.1:latest",
  });

  // Anthropic API key
  game.settings.register(MODULE_ID, "apiKeyAnthropic", {
    name: game.i18n.localize("mercator.settings.apiKeyAnthropic.name"),
    hint: game.i18n.localize("mercator.settings.apiKeyAnthropic.hint"),
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // Image provider selection
  game.settings.register(MODULE_ID, "imageProvider", {
    name: game.i18n.localize("mercator.settings.imageProvider.name"),
    hint: game.i18n.localize("mercator.settings.imageProvider.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "stability",
    choices: {
      stability: "Stability AI",
      openai: "OpenAI (DALL-E)",
      comfyui: "ComfyUI (Local)",
    },
  });

  // Stability AI API key
  game.settings.register(MODULE_ID, "apiKeyStability", {
    name: game.i18n.localize("mercator.settings.apiKeyStability.name"),
    hint: game.i18n.localize("mercator.settings.apiKeyStability.hint"),
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // OpenAI API key
  game.settings.register(MODULE_ID, "apiKeyOpenai", {
    name: game.i18n.localize("mercator.settings.apiKeyOpenai.name"),
    hint: game.i18n.localize("mercator.settings.apiKeyOpenai.hint"),
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  // ComfyUI server URL
  game.settings.register(MODULE_ID, "comfyuiUrl", {
    name: game.i18n.localize("mercator.settings.comfyuiUrl.name"),
    hint: game.i18n.localize("mercator.settings.comfyuiUrl.hint"),
    scope: "world",
    config: false,
    type: String,
    default: "http://localhost:8188",
  });

  // Flux checkpoint filename
  game.settings.register(MODULE_ID, "fluxCheckpoint", {
    name: "Flux Checkpoint",
    hint: "Filename of the Flux.1 Dev checkpoint in your ComfyUI models/checkpoints folder.",
    scope: "world",
    config: false,
    type: String,
    default: "flux1-dev.safetensors",
  });

  // DoRA model filename
  game.settings.register(MODULE_ID, "doraName", {
    name: "DoRA Model",
    hint: "Filename of the RPGmap DoRA in your ComfyUI models/loras folder.",
    scope: "world",
    config: false,
    type: String,
    default: "rpg_maps_dora_v5.safetensors",
  });

  // Vision model name
  game.settings.register(MODULE_ID, "visionModel", {
    name: game.i18n.localize("mercator.settings.visionModel.name"),
    hint: game.i18n.localize("mercator.settings.visionModel.hint"),
    scope: "world",
    config: false,
    type: String,
    default: "llama3.2-vision:latest",
  });

  // Enable vision analysis
  game.settings.register(MODULE_ID, "enableVision", {
    name: game.i18n.localize("mercator.settings.enableVision.name"),
    hint: game.i18n.localize("mercator.settings.enableVision.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // Default art style
  game.settings.register(MODULE_ID, "defaultStyle", {
    name: game.i18n.localize("mercator.settings.defaultStyle.name"),
    hint: game.i18n.localize("mercator.settings.defaultStyle.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "fantasy",
    choices: {
      fantasy: "Classic Fantasy",
      realistic: "Realistic",
      watercolor: "Watercolor",
      inkwash: "Ink Wash",
      digital: "Digital Art",
    },
  });
}

export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
  return game.settings.set(MODULE_ID, key, value);
}

const { ApplicationV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

class MercatorSettingsForm extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "mercator-settings",
    tag: "form",
    window: {
      title: "Mercator - API Configuration",
      icon: "fa-solid fa-key",
    },
    position: {
      width: 500,
    },
    form: {
      closeOnSubmit: true,
      handler: MercatorSettingsForm._onSubmit,
    },
    actions: {},
  };

  static PARTS = {
    form: {
      template: "modules/mercator/templates/settings.hbs",
    },
  };

  async _prepareContext() {
    return {
      ollamaUrl: getSetting("ollamaUrl"),
      ollamaModel: getSetting("ollamaModel"),
      apiKeyAnthropic: getSetting("apiKeyAnthropic"),
      apiKeyStability: getSetting("apiKeyStability"),
      apiKeyOpenai: getSetting("apiKeyOpenai"),
      comfyuiUrl: getSetting("comfyuiUrl"),
      fluxCheckpoint: getSetting("fluxCheckpoint"),
      doraName: getSetting("doraName"),
      visionModel: getSetting("visionModel"),
    };
  }

  static async _onSubmit(event, form, formData) {
    for (const [key, value] of Object.entries(formData.object)) {
      await setSetting(key, value);
    }
    ui.notifications.info("Mercator | API settings saved.");
  }
}
