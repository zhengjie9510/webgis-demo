<template>
  <div id="cesiumContainer">
    <div id="slider"></div>
  </div>
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
      // 开启分屏
      this.split(viewer)
      // 设置相机位置
      const center = Cesium.Cartesian3.fromDegrees(116.38, 39.9);
      viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -1000.0, 3000.0));
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    },
    /**
    * @param {Cesium.Viewer} viewer 控制点
    */
    split: function (viewer) {
      const earthAtNight = viewer.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        })
      );
      earthAtNight.splitDirection = Cesium.SplitDirection.RIGHT; // Only show to the left of the slider.

      // Sync the position of the slider with the split position
      const slider = document.getElementById("slider");
      viewer.scene.splitPosition =
        slider.offsetLeft / slider.parentElement.offsetWidth;

      const handler = new Cesium.ScreenSpaceEventHandler(slider);

      let moveActive = false;

      function move(movement) {
        if (!moveActive) {
          return;
        }

        const relativeOffset = movement.endPosition.x;
        const splitPosition =
          (slider.offsetLeft + relativeOffset) /
          slider.parentElement.offsetWidth;
        slider.style.left = `${100.0 * splitPosition}%`;
        viewer.scene.splitPosition = splitPosition;
      }

      handler.setInputAction(function () {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function () {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.PINCH_START);

      handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

      handler.setInputAction(function () {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function () {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.PINCH_END);
    }
  },
}
</script>

<style lang="scss" scoped>
#cesiumContainer {
  position: absolute;
  height: 100%;
  width: 100%;
}

#slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 5px;
  height: 100%;
  z-index: 9999;
}

#slider:hover {
  cursor: ew-resize;
}
</style>
