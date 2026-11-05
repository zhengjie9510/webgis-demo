// 04-translucent-override.js — Force translucent pass on an opaque source model.
// Without translucencyMode: TRANSLUCENT the material.alpha write is silently ignored
// (INHERIT honors the source material, which here is opaque).
// Asset: Sandcastle SampleData CesiumAir.

import {
  CustomShader,
  CustomShaderTranslucencyMode,
  UniformType,
  Model,
  Cartesian3,
  HeadingPitchRoll,
  Transforms,
} from "cesium";

const xrayShader = new CustomShader({
  translucencyMode: CustomShaderTranslucencyMode.TRANSLUCENT,
  uniforms: {
    u_alpha: { type: UniformType.FLOAT, value: 0.35 },
  },
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      // Cool-tint x-ray look
      material.diffuse = mix(material.diffuse, vec3(0.4, 0.7, 1.0), 0.6);
      material.alpha = u_alpha;
    }
  `,
});

const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000);
const model = await Model.fromGltfAsync({
  url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
  modelMatrix: Transforms.headingPitchRollToFixedFrame(position, new HeadingPitchRoll()),
  customShader: xrayShader,
});
viewer.scene.primitives.add(model);
viewer.camera.flyToBoundingSphere(model.boundingSphere, { duration: 0 });
