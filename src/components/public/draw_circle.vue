<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

class DrawCircle {
  constructor(options) {
    this.layer = new Cesium.CustomDataSource('MyCircles')
    this.center = undefined
    this.activePosition = undefined
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
        if (!this.center) {
          this.center = earthPosition
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // 鼠标移动
    this.handler.setInputAction((move) => {
      if (this.center) {
        const earthPosition = this.getPosition(viewer, move.endPosition)
        if (Cesium.defined(earthPosition)) {
          this.activePosition = earthPosition
          if (!this.activeShape) {
            const radius = new Cesium.CallbackProperty(() => {
              return Cesium.Cartesian3.distance(this.center, this.activePosition);
            }, false);
            this.activeShape = this.drawCircle(this.center, radius)
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    // 单击鼠标右键结束画圆
    this.handler.setInputAction((click) => {
      if (this.activeShape) {
        const earthPosition = this.getPosition(viewer, click.position)
        if (Cesium.defined(earthPosition)) {
          const radius = Cesium.Cartesian3.distance(this.center, earthPosition)
          this.drawCircle(this.center, radius)
          this.layer.entities.remove(this.activeShape)
          this.center = undefined
          this.activePosition = undefined
          this.activeShape = undefined
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  /**
  * 解绑鼠标事件
  */
  unbindAcion() {
    this.handler = this.handler && this.handler.destroy();
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
   * 画圆
   * @param {Cesium.Cartesian3} center 中心点坐标
   * @param {number} radius 半径
   * @return {Cesium.Entity} 圆实体
   */
  drawCircle(center, radius) {
    return this.layer.entities.add({
      position: center,
      ellipse: {
        semiMinorAxis: radius,
        semiMajorAxis: radius,
        material: Cesium.Color.RED.withAlpha(0.5),
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
      const viewer = new Cesium.Viewer('cesiumContainer', { infoBox: false, selectionIndicator: false })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true // 显示帧率

      const drawCircle = new DrawCircle()
      drawCircle.bindAction(viewer)
      drawCircle.addToMap(viewer)
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
