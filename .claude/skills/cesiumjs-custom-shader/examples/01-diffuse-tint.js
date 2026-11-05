// 01-diffuse-tint.js — Time-driven diffuse tint on a Model.
// Asset: Sandcastle-provided SampleData/models/CesiumAir/Cesium_Air.glb.

import {
  CustomShader,
  UniformType,
  Cartesian3,
  Model,
  HeadingPitchRoll,
  Transforms,
} from "cesium";

const tintShader = new CustomShader({
  uniforms: {
    u_tint: { type: UniformType.VEC3, value: new Cartesian3(1.0, 0.5, 0.2) },
    u_time: { type: UniformType.FLOAT, value: 0.0 },
  },
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      float pulse = 0.5 + 0.5 * sin(u_time);
      material.diffuse = mix(material.diffuse, u_tint, pulse);
    }
  `,
});

const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000);
const model = await Model.fromGltfAsync({
  url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
  modelMatrix: Transforms.headingPitchRollToFixedFrame(position, new HeadingPitchRoll()),
  customShader: tintShader,
});
viewer.scene.primitives.add(model);
viewer.camera.flyToBoundingSphere(model.boundingSphere, { duration: 0 });

const start = performance.now();
viewer.scene.postUpdate.addEventListener(() => {
  tintShader.setUniform("u_time", (performance.now() - start) / 1000.0);
});
