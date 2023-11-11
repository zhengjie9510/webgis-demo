<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const key = "cec5eeadc16a3c964451ff083266df0c"

      const viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/vec_w/wmts?tk=" + key,
          layer: "vec",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18,
        })
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true

      // 暗色系
      // viewer.imageryLayers.get(0).hue = 3
      // viewer.imageryLayers.get(0).contrast = -1.2
      viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t{s}.tianditu.gov.cn/ibo_w/wmts?tk=" + key,
        layer: "ibo",
        style: "default",
        tileMatrixSetID: "w",
        format: "tiles",
        maximumLevel: 18,
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
      }))
      viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.gov.cn/cva_w/wmts?tk=" + key,
        layer: "cva",
        style: "default",
        tileMatrixSetID: "w",
        format: "tiles",
        maximumLevel: 18
      }))

      // 将三维球定位到中国
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 10000000),
        orientation: {
          heading: Cesium.Math.toRadians(348.42),
          pitch: Cesium.Math.toRadians(-89.74),
          roll: Cesium.Math.toRadians(0)
        },
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
