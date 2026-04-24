import { registerSettings } from "../src/utils/settings.mjs";
import { MercatorApp } from "../src/MercatorApp.mjs";

const MODULE_ID = "mercator";

Hooks.once("init", () => {
  console.log("Mercator | Initializing AI Map Generator");
  registerSettings();
});

Hooks.once("ready", () => {
  console.log("Mercator | Ready");
});

Hooks.on("getSceneControlButtons", (controls) => {
  controls.tokens.tools.mercator = {
    name: "mercator",
    title: "mercator.button.open",
    icon: "fa-solid fa-map",
    button: true,
    visible: game.user.isGM,
    order: Object.keys(controls.tokens.tools).length,
    onChange: () => {
      const existing = foundry.applications.instances.get("mercator-app");
      if (existing) existing.close();
      else new MercatorApp().render({ force: true });
    },
  };
});

export { MODULE_ID };
