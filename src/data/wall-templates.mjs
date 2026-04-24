const WALL_TEMPLATES = {
  none: () => [],

  single_room: ({ gridWidth, gridHeight }) => {
    const mx = Math.round(gridWidth * 0.2);
    const my = Math.round(gridHeight * 0.2);
    const x1 = mx, y1 = my;
    const x2 = gridWidth - mx, y2 = gridHeight - my;
    const doorX = Math.round((x1 + x2) / 2);
    return [
      { c: [x1, y1, x2, y1], door: 0, ds: 0 },             // north
      { c: [x2, y1, x2, y2], door: 0, ds: 0 },             // east
      { c: [x2, y2, doorX + 1, y2], door: 0, ds: 0 },      // south right of door
      { c: [doorX + 1, y2, doorX - 1, y2], door: 1, ds: 1 }, // south door
      { c: [doorX - 1, y2, x1, y2], door: 0, ds: 0 },      // south left of door
      { c: [x1, y2, x1, y1], door: 0, ds: 0 },             // west
    ];
  },

  multi_room: ({ gridWidth, gridHeight }) => {
    const m = 1;
    const mx = Math.round(gridWidth / 2);
    const my = Math.round(gridHeight / 2);
    const r = mx - m, b = my - m; // right inner, bottom inner
    const doorPos = Math.round(gridWidth * 0.25);
    return [
      // Outer walls
      { c: [m, m, gridWidth - m, m], door: 0, ds: 0 },                           // north
      { c: [gridWidth - m, m, gridWidth - m, gridHeight - m], door: 0, ds: 0 },   // east
      // South wall with entry door
      { c: [gridWidth - m, gridHeight - m, doorPos + 1, gridHeight - m], door: 0, ds: 0 },
      { c: [doorPos + 1, gridHeight - m, doorPos - 1, gridHeight - m], door: 1, ds: 1 },
      { c: [doorPos - 1, gridHeight - m, m, gridHeight - m], door: 0, ds: 0 },
      { c: [m, gridHeight - m, m, m], door: 0, ds: 0 },                           // west
      // Vertical divider with door
      { c: [mx, m, mx, my - 1], door: 0, ds: 0 },
      { c: [mx, my - 1, mx, my + 1], door: 1, ds: 1 },
      { c: [mx, my + 1, mx, gridHeight - m], door: 0, ds: 0 },
      // Horizontal divider with door
      { c: [m, my, mx - 1, my], door: 0, ds: 0 },
      { c: [mx - 1, my, mx + 1, my], door: 1, ds: 1 },
      { c: [mx + 1, my, gridWidth - m, my], door: 0, ds: 0 },
    ];
  },

  corridor: ({ gridWidth, gridHeight }) => {
    const cy = Math.round(gridHeight / 2);
    const hw = 2; // half-width of corridor
    return [
      { c: [0, cy - hw, gridWidth, cy - hw], door: 0, ds: 0 },
      { c: [0, cy + hw, gridWidth, cy + hw], door: 0, ds: 0 },
    ];
  },

  crossroads: ({ gridWidth, gridHeight }) => {
    const cx = Math.round(gridWidth / 2);
    const cy = Math.round(gridHeight / 2);
    const hw = 2;
    return [
      // Top-left block
      { c: [cx - hw, 0, cx - hw, cy - hw], door: 0, ds: 0 },
      { c: [cx - hw, cy - hw, 0, cy - hw], door: 0, ds: 0 },
      // Top-right block
      { c: [cx + hw, 0, cx + hw, cy - hw], door: 0, ds: 0 },
      { c: [cx + hw, cy - hw, gridWidth, cy - hw], door: 0, ds: 0 },
      // Bottom-left block
      { c: [cx - hw, gridHeight, cx - hw, cy + hw], door: 0, ds: 0 },
      { c: [cx - hw, cy + hw, 0, cy + hw], door: 0, ds: 0 },
      // Bottom-right block
      { c: [cx + hw, gridHeight, cx + hw, cy + hw], door: 0, ds: 0 },
      { c: [cx + hw, cy + hw, gridWidth, cy + hw], door: 0, ds: 0 },
    ];
  },

  bridge: ({ gridWidth, gridHeight }) => {
    const cx = Math.round(gridWidth / 2);
    const bw = 1; // bridge half-width
    const start = Math.round(gridHeight * 0.3);
    const end = Math.round(gridHeight * 0.7);
    return [
      { c: [cx - bw, start, cx - bw, end], door: 0, ds: 0 },
      { c: [cx + bw, start, cx + bw, end], door: 0, ds: 0 },
    ];
  },

  arena: ({ gridWidth, gridHeight }) => {
    const cx = gridWidth / 2;
    const cy = gridHeight / 2;
    const rx = gridWidth * 0.4;
    const ry = gridHeight * 0.4;
    const segments = 12;
    const walls = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (2 * Math.PI * i) / segments;
      const a2 = (2 * Math.PI * (i + 1)) / segments;
      walls.push({
        c: [
          Math.round(cx + rx * Math.cos(a1)),
          Math.round(cy + ry * Math.sin(a1)),
          Math.round(cx + rx * Math.cos(a2)),
          Math.round(cy + ry * Math.sin(a2)),
        ],
        door: 0,
        ds: 0,
      });
    }
    return walls;
  },

  camp: ({ gridWidth, gridHeight }) => {
    const m = 2;
    const gateX = Math.round(gridWidth / 2);
    return [
      { c: [m, m, gridWidth - m, m], door: 0, ds: 0 },                             // north
      { c: [gridWidth - m, m, gridWidth - m, gridHeight - m], door: 0, ds: 0 },     // east
      { c: [gridWidth - m, gridHeight - m, gateX + 2, gridHeight - m], door: 0, ds: 0 }, // south right
      // gate gap (no wall segment)
      { c: [gateX - 2, gridHeight - m, m, gridHeight - m], door: 0, ds: 0 },        // south left
      { c: [m, gridHeight - m, m, m], door: 0, ds: 0 },                             // west
    ];
  },
};

export function getWallsForLayout(layoutKey, mapSizeData) {
  const templateFn = WALL_TEMPLATES[layoutKey] || WALL_TEMPLATES.none;
  return templateFn({
    gridWidth: mapSizeData.squares[0],
    gridHeight: mapSizeData.squares[1],
    gridSize: mapSizeData.gridSize,
  });
}
