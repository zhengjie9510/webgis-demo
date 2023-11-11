<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
import { randomPoint } from '@turf/turf'
export default {
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: await Cesium.createWorldTerrainAsync(),
        animation: false,
        timeline: false,
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      const geoidService = await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl("https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/EGM2008/ImageServer");
      const i3sOptions = {
        traceFetches: false, // for tracing I3S fetches
        geoidTiledTerrainProvider: geoidService, // pass the geoid service
      };
      const i3sProvider = await Cesium.I3SDataProvider.fromUrl("https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_3DObjects_1_7/SceneServer/layers/0", i3sOptions)
      viewer.scene.primitives.add(i3sProvider);

      const center = Cesium.Rectangle.center(i3sProvider.extent);
      center.height = 10000.0;
      viewer.camera.setView({
        destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(center),
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
