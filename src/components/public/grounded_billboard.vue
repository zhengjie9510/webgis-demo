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
      const viewer = new Cesium.Viewer('cesiumContainer', { terrainProvider: await Cesium.createWorldTerrainAsync() })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      // 1、生成大量随机点
      const points = randomPoint(500, { bbox: [100, 25, 102, 27] })
      // 2、Cartographic数组
      const positions = []
      for (let point of points.features) {
        const coordinates = point.geometry.coordinates
        const position = Cesium.Cartographic.fromDegrees(coordinates[0], coordinates[1])
        positions.push(position)
      }
      // 3、高程采样
      const pinBuilder = new Cesium.PinBuilder();
      const collection = new Cesium.BillboardCollection()
      const terrainProvider = viewer.terrainProvider
      const promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
      Promise.resolve(promise).then(function (updatedPositions) {
        for (let position of updatedPositions) {
          collection.add({
            position: Cesium.Cartesian3.fromRadians(position.longitude, position.latitude, position.height),
            image: pinBuilder.fromColor(Cesium.Color.fromRandom({ alpha: 1.0 }), 20).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          })
        }
        viewer.scene.primitives.add(collection)
      });

      const center = Cesium.Cartesian3.fromDegrees(101, 26);
      viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -10000.0, 3930.0));
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
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
