<template>
  <div class="popup" v-show="visiable" :style="style">
    <h2 class="popup-title">经纬度</h2>
    <div class="popup-content">
      <div>经度：{{ info.lon }}</div>
      <div>纬度：{{ info.lat }}</div>
      <div>高度：{{ info.height }}</div>
    </div>
    <div class='triangle-bottom'></div>
  </div>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

let handler = undefined
let listener = undefined
let earthPosition = undefined

export default {
  data() {
    return {
      visiable: false,
      style: {
        position: 'absolute',
        top: '100px',
        left: '100px',
      },
      info: {
        lon: 0,
        lat: 0,
        height: 0
      }
    }
  },
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

      // 定位到中国
      viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(73, 3, 136, 54),
        duration: 0,
      })

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction((click) => {
        if (listener) {
          listener()
          listener = undefined
          this.visiable = false
        }
        // 球面
        if (viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
          earthPosition = viewer.scene.camera.pickEllipsoid(click.position);
        }
        // 地形
        else {
          const ray = viewer.camera.getPickRay(click.position);
          earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
        }
        if (earthPosition) {
          const position = viewer.scene.globe.ellipsoid.cartesianToCartographic(earthPosition)
          const lon = Cesium.Math.toDegrees(position.longitude).toFixed(6)
          const lat = Cesium.Math.toDegrees(position.latitude).toFixed(6)
          const height = position.height.toFixed(2)
          this.info = { lon: lon, lat: lat, height: height }
          listener = viewer.scene.postRender.addEventListener(() => {
            const windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, earthPosition);
            if (windowPosition) {
              let position = { top: windowPosition.y - 115 + 'px', left: windowPosition.x - 200 / 2 + 'px' }
              this.style = Object.assign(this.style, position)
              this.visiable = true
            }
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
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

.popup {
  z-index: 1000;
  width: 200px;
  height: 100px;
  border: 2px solid #ffffff;
  border-radius: 4px;
  box-shadow: 0px 0px 2px grey;
  position: absolute;
  background-color: #7fd3cad9;

  .popup-title {
    text-align: center;
    font-size: 18px;
    margin: 0px;
    height: 25px;
  }

  .popup-content {
    margin: 0px 10px;
    height: 75px;
  }

  .triangle-bottom {
    width: 0;
    height: 0;
    border-top: 10px solid #ffffff;
    border-left: 10px dashed transparent;
    border-right: 10px dashed transparent;
    position: absolute;
    left: 90px;
    top: 100px;
  }
}
</style>
