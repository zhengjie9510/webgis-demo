<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

export default {
  data() {
    return { path: process.env.BASE_URL }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      var viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
        }),
        terrainProvider: await Cesium.createWorldTerrainAsync()
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true;

      const initialPosition = Cesium.Cartesian3.fromDegrees(
        -74.01881302800248,
        40.69114333714821,
        753
      );
      const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
        21.27879878293835,
        -21.34390550872461,
        0.0716951918898415
      );
      viewer.scene.camera.setView({
        destination: initialPosition,
        orientation: initialOrientation,
        endTransform: Cesium.Matrix4.IDENTITY,
      });

      const customShader = new Cesium.CustomShader({
        uniforms: {
          maxHeight: {
            type: Cesium.UniformType.FLOAT,
            value: 0.0,
          },
          minHeight: {
            type: Cesium.UniformType.FLOAT,
            value: 0.0,
          },
        },
        fragmentShaderText: `
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
            float curz = fsInput.attributes.positionMC.z;
            float d = (curz - minHeight) / (maxHeight - minHeight);
            float r = 0.01;
            r = fract(r * czm_frameNumber);
            float c = smoothstep(r, r+0.03, d) - smoothstep(r + 0.035,r + 0.04, d);
            vec3 linearColor = mix(vec3(1.0,1.0,1.0) ,vec3(255.0,48.0,48.0)/255.0,r);
            vec3 renderColor = mix(vec3(0.0,0.96,1.0) ,linearColor,c);
            material.diffuse = renderColor;
          }`
      });

      const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188, {
        customShader: customShader,
      })
      const [maxheight, minheight] = [
        tileset.properties['cesium#estimatedHeight'].maximum,
        tileset.properties['cesium#estimatedHeight'].minimum,
      ];
      tileset.customShader.setUniform("maxHeight", maxheight);
      tileset.customShader.setUniform("minHeight", minheight);
      viewer.scene.primitives.add(tileset);
    },
  },
}
</script>

<style lang="scss" scoped>
#cesiumContainer {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
