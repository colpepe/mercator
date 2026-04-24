export const BIOMES = {
  forest: { label: "Forest", promptFragment: "dense forest terrain with trees, undergrowth, leaf-covered ground" },
  plains: { label: "Plains", promptFragment: "open grassy plains, wildflowers, dirt paths" },
  desert: { label: "Desert", promptFragment: "arid desert sand dunes, cracked earth, sparse scrub" },
  swamp: { label: "Swamp", promptFragment: "murky swamp water, gnarled roots, moss-covered ground" },
  tundra: { label: "Tundra", promptFragment: "frozen tundra, snow-covered ground, ice patches" },
  mountain: { label: "Mountain", promptFragment: "rocky mountain terrain, boulders, gravel paths" },
  dungeon: { label: "Dungeon", promptFragment: "stone dungeon floor, carved stone walls, torch sconces" },
  castle: { label: "Castle", promptFragment: "castle interior stone floor, tapestries on walls, ornate tiles" },
  cave: { label: "Cave", promptFragment: "natural cave floor, stalagmite stumps, uneven rock" },
  underwater: { label: "Underwater", promptFragment: "underwater seabed, coral, sand, kelp" },
  sewer: { label: "Sewer", promptFragment: "sewer tunnel, grimy stone channels, flowing waste water" },
  temple: { label: "Temple/Shrine", promptFragment: "sacred temple floor, ritual circles, ornamental stone" },
  tavern: { label: "Tavern/Inn", promptFragment: "wooden tavern floor, planks, barrels, hearthstone" },
  village: { label: "Village/Town", promptFragment: "cobblestone streets, market stalls, building footprints" },
  ship: { label: "Ship/Dock", promptFragment: "wooden ship deck planks, rope coils, dock pilings" },
  feywild: { label: "Feywild", promptFragment: "ethereal fey terrain, bioluminescent plants, magical mushrooms" },
  underdark: { label: "Underdark", promptFragment: "underdark cavern, phosphorescent fungi, dark stone" },
  hellscape: { label: "Hellscape", promptFragment: "hellish terrain, lava flows, charred obsidian ground" },
  random: { label: "Random", promptFragment: null },
};

export const ENCOUNTER_TYPES = {
  combat: { label: "Combat", promptHint: "tactical positions, cover points, choke points" },
  noncombat: { label: "Non-Combat", promptHint: "open spaces, inviting arrangement" },
  vendor: { label: "Vendor", promptHint: "market stalls, display tables, goods" },
  puzzle: { label: "Puzzle/Trap", promptHint: "mysterious symbols on floor, pressure plates, hidden mechanisms" },
  boss: { label: "Boss", promptHint: "large central open area, dramatic focal point" },
  ambush: { label: "Ambush", promptHint: "concealment spots, narrow approach, hidden positions" },
  social: { label: "Social/RP", promptHint: "seating areas, gathering space, comfortable arrangement" },
  rest: { label: "Rest/Camp", promptHint: "campfire ring, bedrolls, supply packs" },
  tim: { label: "Tim", promptHint: "absurd and whimsical details, rubber ducks, inexplicable cheese wheels" },
  random: { label: "Random", promptHint: null },
};

export const TIMES_OF_DAY = {
  dawn: { label: "Dawn", lighting: "warm golden dawn light, long soft shadows to the west" },
  day: { label: "Day", lighting: "bright midday light, short shadows" },
  dusk: { label: "Dusk", lighting: "warm orange dusk light, long shadows to the east" },
  night: { label: "Night", lighting: "cool blue moonlight, deep shadows" },
  underground: { label: "Underground", lighting: "dim ambient torch light, no natural light source" },
};

export const WEATHER = {
  clear: { label: "Clear", effect: "clear skies" },
  rain: { label: "Rain", effect: "rain puddles on ground, wet reflective surfaces" },
  snow: { label: "Snow", effect: "snow covering ground, frost on surfaces" },
  fog: { label: "Fog", effect: "fog wisps, reduced visibility, muted colors" },
  storm: { label: "Storm", effect: "dark storm lighting, wind-blown debris, puddles" },
  sandstorm: { label: "Sandstorm", effect: "sand-hazed atmosphere, sand drifts against objects" },
  none: { label: "None/Interior", effect: "" },
};

export const LAYOUTS = {
  open_field: { label: "Open Field", wallTemplate: "none" },
  clearing: { label: "Clearing", wallTemplate: "none" },
  single_room: { label: "Single Room", wallTemplate: "single_room" },
  multi_room: { label: "Multi-Room", wallTemplate: "multi_room" },
  corridor: { label: "Corridor/Hallway", wallTemplate: "corridor" },
  crossroads: { label: "Crossroads", wallTemplate: "crossroads" },
  bridge: { label: "Bridge/Choke Point", wallTemplate: "bridge" },
  arena: { label: "Arena/Pit", wallTemplate: "arena" },
  camp: { label: "Camp/Outpost", wallTemplate: "camp" },
  random: { label: "Random", wallTemplate: "none" },
};

export const DENSITY = {
  sparse: { label: "Sparse", promptHint: "minimal obstacles, mostly open space" },
  moderate: { label: "Moderate", promptHint: "moderate scatter of obstacles and furniture" },
  dense: { label: "Dense", promptHint: "densely packed obstacles, heavy cover, abundant furniture" },
};

export const POINTS_OF_INTEREST = {
  campfire: { label: "Campfire", promptFragment: "campfire ring with stones" },
  altar: { label: "Altar", promptFragment: "stone altar surface" },
  fountain: { label: "Fountain", promptFragment: "circular fountain basin" },
  bridge: { label: "Bridge", promptFragment: "wooden bridge crossing" },
  trap: { label: "Trap", promptFragment: "suspicious floor markings" },
  treasure: { label: "Treasure", promptFragment: "treasure chest" },
  throne: { label: "Throne", promptFragment: "ornate throne seat" },
  well: { label: "Well", promptFragment: "circular well opening" },
  statue: { label: "Statue", promptFragment: "statue base and pedestal" },
  cage: { label: "Cage/Cell", promptFragment: "iron cage or cell bars" },
  bar: { label: "Bar/Counter", promptFragment: "long bar counter surface" },
};

export const ELEVATION = {
  flat: { label: "Flat", promptHint: "single flat elevation" },
  multilevel: { label: "Multi-level", promptHint: "visible elevation changes, stairs, raised platforms" },
  cliffs: { label: "Cliffs/Ledges", promptHint: "cliff edges, rocky ledges, sharp drop-offs" },
};

export const SEASONS = {
  spring: { label: "Spring", promptFragment: "spring blossoms, fresh green, budding plants" },
  summer: { label: "Summer", promptFragment: "lush summer foliage, vibrant greens, full canopy" },
  autumn: { label: "Autumn", promptFragment: "autumn leaves, orange and red foliage, fallen leaves" },
  winter: { label: "Winter", promptFragment: "bare branches, frost, muted winter palette" },
};
