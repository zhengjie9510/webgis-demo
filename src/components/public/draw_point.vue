<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

class DrawPoints {
  constructor(options) {
    this.layer = new Cesium.CustomDataSource('MyPoints')
    this.handler = undefined
  }
  /**
   * 添加鼠标点击事件
   * @param {Cesium.Viewer} viewer 目标地图
   */
  bindAction(viewer) {
    if (!this.handler) {
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    }
    this.handler.setInputAction((click) => {
      let earthPosition = undefined
      // 球面
      if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        earthPosition = viewer.scene.camera.pickEllipsoid(click.position);
      }
      // 地形
      else {
        const ray = viewer.camera.getPickRay(click.position);
        earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
      }
      if (Cesium.defined(earthPosition)) {
        const entity = this.createPoint(earthPosition)
        this.layer.entities.add(entity)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }
  /**
   * 创建点
   * @param {Cesium.Cartesian3} worldPosition A 3D Cartesian point.
   * @return {Cesium.Entity} 点实体
   */
  createPoint(worldPosition) {
    const point = new Cesium.Entity({
      position: worldPosition,
      point: {
        color: Cesium.Color.RED,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
    return point;
  }
  /**
   * 添加图层
   * @param {Cesium.Viewer} viewer 目标地图
   */
  addToMap(viewer) {
    viewer.dataSources.add(this.layer);
  }
}
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"],
        })
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      const drawPoints = new DrawPoints()
      drawPoints.bindAction(viewer)
      drawPoints.addToMap(viewer)
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
