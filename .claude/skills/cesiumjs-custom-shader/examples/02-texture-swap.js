// 02-texture-swap.js — Animated texture uniform via SAMPLER_2D + TextureUniform.
// Assets: Sandcastle SampleData — CesiumAir + cesium_stripes.png.

import {
  CustomShader,
  UniformType,
  TextureUniform,
  Model,
  Cartesian3,
  HeadingPitchRoll,
  Transforms,
} from "cesium";

const stripeShader = new CustomShader({
  uniforms: {
    u_time: { type: UniformType.FLOAT, value: 0.0 },
    u_stripes: {
      type: UniformType.SAMPLER_2D,
      value: new TextureUniform({ url: "../../SampleData/cesium_stripes.png", repeat: true }),
    },
  },
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      vec2 uv = fsInput.attributes.texCoord_0 + vec2(0.1 * u_time, 0.0);
      material.diffuse = texture(u_stripes, uv).rgb;
    }
  `,
});

const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000);
const model = await Model.fromGltfAsync({
  url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
  modelMatrix: Transforms.headingPitchRollToFixedFrame(position, new HeadingPitchRoll()),
  customShader: stripeShader,
});
viewer.scene.primitives.add(model);
viewer.camera.flyToBoundingSphere(model.boundingSphere, { duration: 0 });

const start = performance.now();
viewer.scene.postUpdate.addEventListener(() => {
  stripeShader.setUniform("u_time", (performance.now() - start) / 1000.0);
});
