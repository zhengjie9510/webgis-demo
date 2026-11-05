// 06-metadata-ramp.js — Fragment-shader color ramp driven by EXT_structural_metadata
// property texture (per-texel). The `insulation` property is UINT8 with normalized:true,
// so it arrives in GLSL as a float in [0, 1] — map directly through a color ramp.
// Asset: CesiumGS/3d-tiles-samples — SimplePropertyTexture (EXT_structural_metadata
// with three UINT8 scalar properties via propertyTextures).
//   https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/glTF/EXT_structural_metadata/SimplePropertyTexture/tileset.json
//
// Note on assets: public .glb files carrying EXT_structural_metadata are scarce. The skill
// documents this example on a Cesium3DTileset only; the shader surface is identical on Model.
//
// Note on types: after 1.139 (#13135), unsigned metadata preserves its signedness — for
// non-normalized UINT8 properties such as `insideTemperature` you would write
// `uint t = fsInput.metadata.insideTemperature; float f = float(t) / 255.0;`. `insulation`
// is declared `normalized: true`, so the runtime delivers a float in [0, 1] directly.

import { CustomShader, LightingModel, Cesium3DTileset } from "cesium";

const rampShader = new CustomShader({
  lightingModel: LightingModel.UNLIT,
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      float t = fsInput.metadata.insulation;   // normalized UINT8 → float in [0, 1]
      // cool → warm ramp: thin insulation (0) is cold/blue, thick (1) is warm/red
      material.diffuse = mix(vec3(0.1, 0.3, 0.9), vec3(1.0, 0.3, 0.1), t);
    }
  `,
});

const tileset = await Cesium3DTileset.fromUrl(
  "https://raw.githubusercontent.com/CesiumGS/3d-tiles-samples/main/glTF/EXT_structural_metadata/SimplePropertyTexture/tileset.json",
  { customShader: rampShader },
);
viewer.scene.primitives.add(tileset);
viewer.zoomTo(tileset);
