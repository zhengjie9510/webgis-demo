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
      var viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.primitives.add(Cesium.createOsmBuildings());

      // 创建路径
      var positions = [
        Cesium.Cartographic.fromDegrees(-122.4041, 37.7833),
        Cesium.Cartographic.fromDegrees(-118.2437, 34.0522),
        Cesium.Cartographic.fromDegrees(-74.0059, 40.7128)
      ];
      var property = new Cesium.SampledPositionProperty();
      for (var i = 0; i < positions.length; i++) {
        var position = Cesium.Cartesian3.fromRadians(
          positions[i].longitude,
          positions[i].latitude,
          positions[i].height
        );
        var time = Cesium.JulianDate.addSeconds(
          viewer.clock.startTime,
          i * 10,
          new Cesium.JulianDate()
        );
        property.addSample(time, position);
      }
      // 创建路径实体
      var entity = viewer.entities.add({
        name: "Path",
        position: property,
        path: {
          leadTime: 0,
          trailTime: 60,
          resolution: 1,
          width: 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.YELLOW
          })
        }
      });
      // 创建路径漫游
      var path = entity.path;
      viewer.camera.flyPath(path, {
        duration: 10,
        pitchAdjustHeight: 1000,
        maxPitch: Cesium.Math.toRadians(70),
        onComplete: function () {
          viewer.clock.shouldAnimate = false;
        }
      });
      // 播放动画
      viewer.clock.shouldAnimate = true;
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
