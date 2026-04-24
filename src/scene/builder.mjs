export class SceneBuilder {
  async build(imageBlob, metadata, visionData = null) {
    const imagePath = await this._uploadImage(imageBlob, metadata.sceneName);

    const sceneData = {
      name: metadata.sceneName,
      width: metadata.width || 3360,
      height: metadata.height || 2520,
      background: { src: imagePath },
      grid: {
        type: 1, // Square grid
        size: metadata.gridSize || 140,
        distance: 5,
        units: "ft",
      },
      tokenVision: true,
      fogExploration: true,
      darkness: metadata.darkness || 0,
      flags: {
        mercator: {
          generated: true,
          description: metadata.description,
          layout: metadata.layout || null,
          terrain: visionData?.terrain || null,
        },
      },
    };

    const scene = await Scene.create(sceneData);

    // Merge template walls + any vision-detected walls/doors
    const allWalls = [...(metadata.walls || [])];
    if (visionData?.additionalWalls?.length) {
      allWalls.push(...visionData.additionalWalls);
    }
    if (visionData?.doors?.length) {
      allWalls.push(...visionData.doors);
    }

    if (allWalls.length > 0) {
      const walls = this._buildWalls(allWalls, metadata.gridSize);
      await scene.createEmbeddedDocuments("Wall", walls);
      ui.notifications.info(`Mercator | Scene "${scene.name}" created with ${walls.length} walls.`);
    } else {
      ui.notifications.info(`Mercator | Scene "${scene.name}" created.`);
    }

    return scene;
  }

  _buildWalls(wallData, gridSize) {
    console.log("Mercator | Building walls with gridSize:", gridSize);

    const walls = wallData.map(wall => {
      const [x1, y1, x2, y2] = wall.c;
      const pixelCoords = [
        x1 * gridSize,
        y1 * gridSize,
        x2 * gridSize,
        y2 * gridSize,
      ];

      return {
        c: pixelCoords,
        move: CONST.WALL_MOVEMENT_TYPES.NORMAL,
        sight: CONST.WALL_SENSE_TYPES.NORMAL,
        sound: CONST.WALL_SENSE_TYPES.NORMAL,
        dir: CONST.WALL_DIRECTIONS.BOTH,
        door: wall.door || CONST.WALL_DOOR_TYPES.NONE,
        ds: wall.ds || CONST.WALL_DOOR_STATES.CLOSED,
        flags: {
          mercator: {
            generated: true,
            gridCoords: wall.c,
          },
        },
      };
    });

    console.log("Mercator | Created", walls.length, "wall documents");
    return walls;
  }

  async _uploadImage(blob, sceneName) {
    const safeName = sceneName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const timestamp = Date.now();
    const filename = `${safeName}-${timestamp}.png`;

    const file = new File([blob], filename, { type: "image/png" });

    const targetDir = "mercator";
    const FilePicker = foundry.applications.apps.FilePicker.implementation;
    try {
      await FilePicker.createDirectory("data", targetDir);
    } catch {
      // Directory likely already exists
    }

    const response = await FilePicker.upload("data", targetDir, file);
    if (!response?.path) {
      throw new Error("Failed to upload generated map image to Foundry");
    }

    return response.path;
  }
}
