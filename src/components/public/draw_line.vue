<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

class DrawLines {
  constructor(options) {
    this.layer = new Cesium.CustomDataSource('MyLines')
    this.activeShapePoints = []
    this.activeShape = undefined
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
    // 鼠标左键单击画点
    this.handler.setInputAction((click) => {
      const earthPosition = this.getPosition(viewer, click.position)
      if (Cesium.defined(earthPosition)) {
        if (this.activeShapePoints.length === 0) {
          this.activeShapePoints.push(earthPosition)
          const dynamicPositions = new Cesium.CallbackProperty(() => {
            return this.activeShapePoints;
          }, false);
          this.activeShape = this.drawLine(dynamicPositions)
        }
        this.activeShapePoints.push(earthPosition)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // 鼠标移动
    this.handler.setInputAction((move) => {
      if (this.activeShapePoints.length >= 2) {
        const earthPosition = this.getPosition(viewer, move.endPosition)
        if (Cesium.defined(earthPosition)) {
          this.activeShapePoints.pop()
          this.activeShapePoints.push(earthPosition)
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    // 单击鼠标右键结束画线
    this.handler.setInputAction((click) => {
      this.activeShapePoints.pop();
      this.drawLine(this.activeShapePoints)
      this.layer.entities.remove(this.activeShape)
      this.activeShapePoints = []
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  /**
   * 添加鼠标点击事件的位置
   * @param {Cesium.Viewer} viewer 目标地图
   * @param {Cesium.Cartesian2} position 鼠标位置
   * @return {Cesium.Cartesian3} 鼠标点击位置的坐标
   */
  getPosition(viewer, position) {
    let earthPosition = undefined
    // 球面
    if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
      earthPosition = viewer.scene.camera.pickEllipsoid(position);
    }
    // 地形
    else {
      const ray = viewer.camera.getPickRay(position);
      earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
    }
    return earthPosition
  }
  /**
   * 画线
   * @param {array<Cesium.Cartesian3>} positionData 线坐标
   */
  drawLine(positionData) {
    return this.layer.entities.add({
      polyline: {
        positions: positionData,
        clampToGround: true,
        width: 3,
      },
    });
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

      const drawLines = new DrawLines()
      drawLines.bindAction(viewer)
      drawLines.addToMap(viewer)
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
