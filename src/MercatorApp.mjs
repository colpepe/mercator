import { getLLMClient } from "./api/llm-provider.mjs";
import { getImageProvider } from "./api/image-provider.mjs";
import { MAP_SIZES } from "./api/llm-prompt.mjs";
import { SceneBuilder } from "./scene/builder.mjs";
import { getSetting } from "./utils/settings.mjs";
import { buildImagePrompt, deriveDarkness } from "./prompt/prompt-builder.mjs";
import { getWallsForLayout } from "./data/wall-templates.mjs";
import { LAYOUTS } from "./data/dropdown-options.mjs";
import {
  BIOMES, ENCOUNTER_TYPES, TIMES_OF_DAY, WEATHER,
  DENSITY, POINTS_OF_INTEREST, ELEVATION, SEASONS,
} from "./data/dropdown-options.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

export class MercatorApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "mercator-app",
    tag: "div",
    window: {
      title: "mercator.app.title",
      icon: "fa-solid fa-map",
      resizable: true,
    },
    position: {
      width: 580,
      height: "auto",
    },
    classes: ["mercator"],
    actions: {
      generate: MercatorApp._onGenerate,
      createScene: MercatorApp._onCreateScene,
    },
  };

  static PARTS = {
    main: {
      template: "modules/mercator/templates/mercator-app.hbs",
    },
  };

  _imageBlob = null;
  _appState = {
    prompt: "",
    sceneName: "",
    provider: "",
    mapSize: "small",
    generating: false,
    status: null,
    statusClass: "",
    statusIcon: "",
    previewUrl: null,
    metadata: null,
    // Map configuration dropdowns
    biome: "forest",
    encounterType: "combat",
    timeOfDay: "day",
    weather: "clear",
    layout: "open_field",
    density: "moderate",
    pointsOfInterest: [],
    elevation: "flat",
    season: "summer",
    visionEnabled: false,
  };

  _onFirstRender() {
    this._appState.provider = getSetting("imageProvider");
    this._appState.visionEnabled = getSetting("enableVision") || false;
  }

  async _prepareContext() {
    return {
      ...this._appState,
      biomes: BIOMES,
      encounterTypes: ENCOUNTER_TYPES,
      timesOfDay: TIMES_OF_DAY,
      weatherOptions: WEATHER,
      layouts: LAYOUTS,
      densityOptions: DENSITY,
      pointsOfInterest: POINTS_OF_INTEREST,
      elevationOptions: ELEVATION,
      seasons: SEASONS,
    };
  }

  _onRender(context, options) {
    const el = this.element;

    // Existing fields
    this._bindInput(el, "#mercator-prompt", "prompt");
    this._bindInput(el, "#mercator-scene-name", "sceneName");
    this._bindSelect(el, "#mercator-provider", "provider");
    this._bindSelect(el, "#mercator-map-size", "mapSize");

    // Map configuration dropdowns
    this._bindSelect(el, "#mercator-biome", "biome");
    this._bindSelect(el, "#mercator-layout", "layout");
    this._bindSelect(el, "#mercator-encounter", "encounterType");
    this._bindSelect(el, "#mercator-density", "density");
    this._bindSelect(el, "#mercator-time", "timeOfDay");
    this._bindSelect(el, "#mercator-weather", "weather");
    this._bindSelect(el, "#mercator-season", "season");
    this._bindSelect(el, "#mercator-elevation", "elevation");

    // Multi-select: Points of Interest
    const poi = el.querySelector("#mercator-poi");
    if (poi) {
      // Restore selected state
      for (const opt of poi.options) {
        opt.selected = this._appState.pointsOfInterest.includes(opt.value);
      }
      poi.addEventListener("change", () => {
        this._appState.pointsOfInterest = Array.from(poi.selectedOptions).map(o => o.value);
      });
    }

    // Vision toggle
    const vision = el.querySelector("#mercator-vision");
    if (vision) {
      vision.checked = this._appState.visionEnabled;
      vision.addEventListener("change", (e) => {
        this._appState.visionEnabled = e.target.checked;
      });
    }
  }

  _bindInput(el, selector, stateKey) {
    const field = el.querySelector(selector);
    if (field) {
      field.value = this._appState[stateKey];
      field.addEventListener("input", (e) => {
        this._appState[stateKey] = e.target.value;
      });
    }
  }

  _bindSelect(el, selector, stateKey) {
    const field = el.querySelector(selector);
    if (field) {
      field.value = this._appState[stateKey];
      field.addEventListener("change", (e) => {
        this._appState[stateKey] = e.target.value;
      });
    }
  }

  static async _onGenerate() {
    const app = this;
    const sizeKey = app._appState.mapSize || "small";
    const mapSize = MAP_SIZES[sizeKey];

    app._appState.generating = true;
    app._appState.previewUrl = null;
    app._appState.metadata = null;
    app._imageBlob = null;

    try {
      // Layer 1: Build composed prompt from dropdown selections
      const selections = {
        biome: app._appState.biome,
        encounterType: app._appState.encounterType,
        timeOfDay: app._appState.timeOfDay,
        weather: app._appState.weather,
        layout: app._appState.layout,
        density: app._appState.density,
        pointsOfInterest: app._appState.pointsOfInterest,
        elevation: app._appState.elevation,
        season: app._appState.season,
        freeText: app._appState.prompt,
      };

      const composedPrompt = buildImagePrompt(selections);
      console.log("Mercator | Composed prompt:", composedPrompt);

      // Polish with LLM
      const llmProvider = getSetting("llmProvider");
      const llmName = llmProvider === "ollama" ? "Ollama" : "Claude";
      app._setStatus("info", "fa-brain", `Refining prompt with ${llmName}...`);

      const llm = await getLLMClient();
      const style = getSetting("defaultStyle");
      const metadata = await llm.refinePrompt(composedPrompt, style, mapSize, selections);

      console.log("Mercator | LLM metadata received:", metadata);

      // Enforce selected size and derive darkness from time of day
      metadata.width = mapSize.pixels[0];
      metadata.height = mapSize.pixels[1];
      metadata.gridSize = mapSize.gridSize;
      metadata.darkness = metadata.darkness ?? deriveDarkness(app._appState.timeOfDay);

      // Store layout for wall template lookup during scene creation
      metadata.layout = app._appState.layout;

      if (app._appState.sceneName.trim()) {
        metadata.sceneName = app._appState.sceneName.trim();
      }
      app._appState.metadata = metadata;

      // Layer 2: Generate image
      const imgProvider = getSetting("imageProvider");
      const imgName = imgProvider === "comfyui" ? "ComfyUI" : imgProvider === "stability" ? "Stability AI" : "DALL-E";
      const genStart = Date.now();
      app._genTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - genStart) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        app._setStatus("info", "fa-image", `Generating image with ${imgName}... (${timeStr})`);
      }, 1000);

      const provider = await getImageProvider();
      app._imageBlob = await provider.generate(metadata.imagePrompt, {
        width: mapSize.pixels[0],
        height: mapSize.pixels[1],
      });

      clearInterval(app._genTimer);
      app._genTimer = null;

      // Show preview
      const totalSecs = Math.floor((Date.now() - genStart) / 1000);
      const totalMins = Math.floor(totalSecs / 60);
      const remSecs = totalSecs % 60;
      const totalStr = totalMins > 0 ? `${totalMins}m ${remSecs}s` : `${totalSecs}s`;
      app._appState.previewUrl = URL.createObjectURL(app._imageBlob);
      app._setStatus("success", "fa-check", `Map generated in ${totalStr}! Review and create scene.`);
    } catch (err) {
      console.error("Mercator | Generation error:", err);
      app._setStatus("error", "fa-exclamation-triangle", `Error: ${err.message}`);
    } finally {
      if (app._genTimer) {
        clearInterval(app._genTimer);
        app._genTimer = null;
      }
      app._appState.generating = false;
      app.render({ force: false });
    }
  }

  static async _onCreateScene() {
    const app = this;
    if (!app._imageBlob || !app._appState.metadata) {
      ui.notifications.warn("Generate a map first.");
      return;
    }

    try {
      const metadata = app._appState.metadata;
      const sizeKey = app._appState.mapSize || "small";
      const mapSize = MAP_SIZES[sizeKey];

      // Get walls from layout template
      const layoutKey = LAYOUTS[metadata.layout]?.wallTemplate || "none";
      const walls = getWallsForLayout(layoutKey, mapSize);
      metadata.walls = walls;

      console.log("Mercator | Layout:", metadata.layout, "-> template:", layoutKey, "-> walls:", walls.length);

      // Layer 3: Optional vision pass
      let visionData = null;
      if (app._appState.visionEnabled) {
        try {
          app._setStatus("info", "fa-eye", "Analyzing map with vision model...");
          app.render({ force: false });

          const { VisionAnalyzer } = await import("./api/vision.mjs");
          const analyzer = new VisionAnalyzer();
          visionData = await analyzer.analyze(app._imageBlob, mapSize);
          console.log("Mercator | Vision analysis:", visionData);
        } catch (err) {
          console.warn("Mercator | Vision analysis failed, continuing without:", err.message);
          ui.notifications.warn(`Vision analysis skipped: ${err.message}`);
        }
      }

      app._setStatus("info", "fa-upload", game.i18n.localize("mercator.app.status.creating"));
      app.render({ force: false });

      const builder = new SceneBuilder();
      const scene = await builder.build(app._imageBlob, metadata, visionData);

      if (canvas.ready && canvas.scene) {
        await new Promise(resolve => {
          if (canvas.loading) {
            Hooks.once("canvasReady", resolve);
          } else {
            resolve();
          }
        });
      }

      await scene.view();
      app.close();
    } catch (err) {
      console.error("Mercator | Scene creation error:", err);
      app._setStatus("error", "fa-exclamation-triangle", `Error: ${err.message}`);
      app.render({ force: false });
    }
  }

  _setStatus(cls, icon, message) {
    this._appState.statusClass = cls;
    this._appState.statusIcon = icon;
    this._appState.status = message;
    this.render({ force: false });
  }

  async close(options) {
    if (this._appState.previewUrl) {
      URL.revokeObjectURL(this._appState.previewUrl);
    }
    return super.close(options);
  }
}
