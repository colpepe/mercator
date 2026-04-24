import {
  BIOMES, ENCOUNTER_TYPES, TIMES_OF_DAY, WEATHER,
  DENSITY, POINTS_OF_INTEREST, ELEVATION, SEASONS,
} from "../data/dropdown-options.mjs";

const OUTDOOR_BIOMES = ["forest", "plains", "desert", "swamp", "tundra", "mountain", "village", "ship"];

const LAYOUT_FRAGMENTS = {
  open_field: "wide open field, no structures",
  clearing: "natural clearing in vegetation, open center area",
  single_room: "single enclosed room, stone or wooden walls visible from above",
  multi_room: "multiple connected rooms seen from above, doorways between rooms",
  corridor: "long corridor hallway, parallel walls",
  crossroads: "intersection of corridors forming a crossroads",
  bridge: "narrow bridge or choke point, flanked by terrain",
  arena: "circular arena or pit, defined boundary",
  camp: "camp or outpost with perimeter boundary, tents and supplies",
  random: "varied terrain layout",
};

export function buildImagePrompt(selections) {
  const parts = [
    "top-down overhead view, flat 2d battle map, tabletop RPG map, perfectly flat",
  ];

  // Biome
  const biome = resolveRandom(BIOMES, selections.biome);
  if (biome?.promptFragment) parts.push(biome.promptFragment);

  // Season (outdoor biomes only)
  if (OUTDOOR_BIOMES.includes(selections.biome)) {
    const season = SEASONS[selections.season];
    if (season?.promptFragment) parts.push(season.promptFragment);
  }

  // Layout
  const layoutFrag = LAYOUT_FRAGMENTS[selections.layout];
  if (layoutFrag) parts.push(layoutFrag);

  // Density
  const density = DENSITY[selections.density];
  if (density?.promptHint) parts.push(density.promptHint);

  // Points of interest
  if (selections.pointsOfInterest?.length > 0) {
    const poiFragments = selections.pointsOfInterest
      .map(key => POINTS_OF_INTEREST[key]?.promptFragment)
      .filter(Boolean);
    if (poiFragments.length) parts.push(poiFragments.join(", "));
  }

  // Elevation
  const elevation = ELEVATION[selections.elevation];
  if (elevation?.promptHint && selections.elevation !== "flat") {
    parts.push(elevation.promptHint);
  }

  // Encounter type
  const encounter = resolveRandom(ENCOUNTER_TYPES, selections.encounterType);
  if (encounter?.promptHint) parts.push(encounter.promptHint);

  // Time of day
  const time = TIMES_OF_DAY[selections.timeOfDay];
  if (time?.lighting) parts.push(time.lighting);

  // Weather
  const weather = WEATHER[selections.weather];
  if (weather?.effect) parts.push(weather.effect);

  // Free-text additions
  if (selections.freeText?.trim()) parts.push(selections.freeText.trim());

  return parts.join(", ");
}

export function deriveDarkness(timeOfDay) {
  const map = { dawn: 0.2, day: 0, dusk: 0.4, night: 0.7, underground: 0.6 };
  return map[timeOfDay] ?? 0;
}

function resolveRandom(optionsObj, key) {
  if (key === "random") {
    const keys = Object.keys(optionsObj).filter(k => k !== "random");
    const pick = keys[Math.floor(Math.random() * keys.length)];
    return optionsObj[pick];
  }
  return optionsObj[key];
}
