// 07-voxel-shader.js — Fragment-only custom shader on a VoxelPrimitive.
// Reduced struct availability: attributes.positionEC and attributes.normalEC only,
// no FeatureIds, no MetadataClass, metadataStatistics has only min/max.
// Asset: CesiumGS/cesium Specs — VoxelBox3DTiles (SCALAR FLOAT32 property `a`).
//   https://raw.githubusercontent.com/CesiumGS/cesium/main/Specs/Data/Cesium3DTiles/Voxel/VoxelBox3DTiles/tileset.json

import { CustomShader, Cesium3DTilesVoxelProvider, VoxelPrimitive } from "cesium";

const voxelShader = new CustomShader({
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      float v = fsInput.metadata.a;
      // cool → warm gradient, semi-transparent so raymarching accumulates
      material.diffuse = mix(vec3(0.1, 0.2, 0.8), vec3(1.0, 0.6, 0.1), v);
      material.alpha = 0.3 * v;
    }
  `,
});

const provider = await Cesium3DTilesVoxelProvider.fromUrl(
  "https://raw.githubusercontent.com/CesiumGS/cesium/main/Specs/Data/Cesium3DTiles/Voxel/VoxelBox3DTiles/tileset.json",
);

const voxelPrimitive = new VoxelPrimitive({ provider, customShader: voxelShader });
viewer.scene.primitives.add(voxelPrimitive);
voxelPrimitive.nearestSampling = true;
viewer.camera.flyToBoundingSphere(voxelPrimitive.boundingSphere, { duration: 0 });
