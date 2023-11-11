<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
export default {
  data() {
    return {
      path: process.env.BASE_URL
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const viewer = new Cesium.Viewer('cesiumContainer', {
        // terrainProvider: await Cesium.createWorldTerrainAsync(),
        animation: false,
        timeline: false,
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      // Position a model with modelMatrix and display it with a minimum size of 128 pixels
      const position = Cesium.Cartesian3.fromDegrees(
        114.46, 34.92, 100
      );
      const headingPositionRoll = new Cesium.HeadingPitchRoll();
      const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
        "north",
        "west"
      );
      try {
        const model = await Cesium.Model.fromGltfAsync({
          url: this.path + "SampleData/models/Bee/Bee.glb",
          scale: 100000,
          modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
            position,
            headingPositionRoll,
            Cesium.Ellipsoid.WGS84,
            fixedFrameTransform
          ),
          minimumPixelSize: 128,
        });
        viewer.scene.primitives.add(model);
      } catch (error) {
        console.log(`Failed to load model. ${error}`);
      }

      let angle = 0.0
      viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(angle), Cesium.Math.toRadians(-30), 2000))
      viewer.clock.onTick.addEventListener(() => {
        angle += 0.5 * viewer.clock.multiplier;
        const heading = Cesium.Math.toRadians(angle)
        const pitch = viewer.camera.pitch
        viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(heading, pitch, 2000))
      });
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
