// 03-feature-id-tileset.js — Classification coloring by feature ID on a 3D Tileset.
// Asset: CesiumGS/3d-tiles-samples — FeatureIdAttributeAndPropertyTable (real EXT_mesh_features).
//   https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/glTF/EXT_structural_metadata/FeatureIdAttributeAndPropertyTable/tileset.json
// Fallback: CesiumGS/cesium — BatchedWithBatchTable (legacy 3D Tiles 1.0 BATCH_ID, remaps to featureId_0).

import { CustomShader, LightingModel, Cesium3DTileset } from "cesium";

const classifyShader = new CustomShader({
  lightingModel: LightingModel.UNLIT,
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      int id = fsInput.featureIds.featureId_0;
      if (id == 0) {
        material.diffuse = vec3(1.0, 0.3, 0.3);  // class 0 — red
      } else if (id == 1) {
        material.diffuse = vec3(0.3, 1.0, 0.3);  // class 1 — green
      } else {
        material.diffuse = vec3(0.3, 0.3, 1.0);  // other — blue
      }
    }
  `,
});

const tileset = await Cesium3DTileset.fromUrl(
  "https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/glTF/EXT_structural_metadata/FeatureIdAttributeAndPropertyTable/tileset.json",
  { customShader: classifyShader },
);
viewer.scene.primitives.add(tileset);
viewer.zoomTo(tileset);
