// 05-vertex-displacement.js — Normal-offset vertex displacement with a varying.
// Warning: vsOutput.positionMC writes do NOT update the primitive bounding sphere —
// heavily displaced meshes can be frustum-culled unexpectedly. Use modest amplitudes.
// Asset: Sandcastle SampleData CesiumAir.

import {
  CustomShader,
  UniformType,
  VaryingType,
  Model,
  Cartesian3,
  HeadingPitchRoll,
  Transforms,
} from "cesium";

const waveShader = new CustomShader({
  uniforms: {
    u_amp: { type: UniformType.FLOAT, value: 0.5 },
    u_time: { type: UniformType.FLOAT, value: 0.0 },
  },
  varyings: { v_disp: VaryingType.FLOAT },
  vertexShaderText: `
    void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
      float d = sin(vsInput.attributes.positionMC.x * 0.5 + u_time * 2.0) * u_amp;
      vsOutput.positionMC += vsInput.attributes.normalMC * d;
      v_disp = d;
    }
  `,
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      float t = clamp(v_disp / 1.0 + 0.5, 0.0, 1.0);
      material.diffuse = mix(vec3(0.2, 0.3, 1.0), vec3(1.0, 0.3, 0.2), t);
    }
  `,
});

const position = Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000);
const model = await Model.fromGltfAsync({
  url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
  modelMatrix: Transforms.headingPitchRollToFixedFrame(position, new HeadingPitchRoll()),
  customShader: waveShader,
});
viewer.scene.primitives.add(model);
viewer.camera.flyToBoundingSphere(model.boundingSphere, { duration: 0 });

const start = performance.now();
viewer.scene.postUpdate.addEventListener(() => {
  waveShader.setUniform("u_time", (performance.now() - start) / 1000.0);
});
