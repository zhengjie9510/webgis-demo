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
      const viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      const pointCollection = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection({ blendOption: Cesium.BlendOption.OPAQUE }));
      for (let longitude = -180; longitude < 180; longitude++) {
        let color = Cesium.Color.PINK;
        if ((longitude % 2) === 0) {
          color = Cesium.Color.CYAN;
        }
        for (let latitude = -90; latitude < 90; latitude++) {
          pointCollection.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            color: color,
            pixelSize: 3
          });
        }
      }
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
