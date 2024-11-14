<template>
  <div id="cesiumContainer"></div>
  <div class="skybox">
    <el-button type="primary" size="small" v-for="(value,key) in skyBoxConfig"
               :key="key"
               @click="toggleSkybox(key)">{{key}}
    </el-button>
  </div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

import SkyBox from '@/components/public/plugins/skybox'

let currentSkybox
let defaultSkybox
export default {
  data(){
    return {
      skyBoxConfig : {
        '默认':undefined,
        '蓝天':{
          positiveX:'./skybox/lantian/Right.jpg',
          negativeX:'./skybox/lantian/Left.jpg',
          positiveY:'./skybox/lantian/Front.jpg',
          negativeY:'.//skybox/lantian/Back.jpg',
          positiveZ:'.//skybox/lantian/Up.jpg',
          negativeZ:'.//skybox/lantian/Down.jpg',
        },
        '晚霞':{
          positiveX:'.//skybox/wanxia/SunSetRight.png',
          negativeX:'.//skybox/wanxia/SunSetLeft.png',
          positiveY:'.//skybox/wanxia/SunSetFront.png',
          negativeY:'.//skybox/wanxia/SunSetBack.png',
          positiveZ:'.//skybox/wanxia/SunSetUp.png',
          negativeZ:'.//skybox/wanxia/SunSetDown.png',
        },
        '晴天':{
          positiveX:'.//skybox/qingtian/rightav9.jpg',
          negativeX:'.//skybox/qingtian/leftav9.jpg',
          positiveY:'.//skybox/qingtian/frontav9.jpg',
          negativeY:'.//skybox/qingtian/backav9.jpg',
          positiveZ:'.//skybox/qingtian/topav9.jpg',
          negativeZ:'.//skybox/qingtian/bottomav9.jpg',
        }
      }
    }
  },
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
      currentSkybox = viewer.scene.skyBox

      viewer.scene.preUpdate.addEventListener(() => {
        //获取相机高度
        let position = viewer.scene.camera.position;
        let cameraHeight = Cesium.Cartographic.fromCartesian(position).height;
        if (cameraHeight < 240000) {
          viewer.scene.skyBox = currentSkybox
          viewer.scene.skyAtmosphere.show = currentSkybox === defaultSkybox;
        } else {
          viewer.scene.skyBox = defaultSkybox;
          viewer.scene.skyAtmosphere.show = true;
        }
      })
      currentSkybox = defaultSkybox

      this.viewer = viewer
    },

    toggleSkybox(name) {
      if (this.viewer) {
        if (name === '默认') {
          currentSkybox = defaultSkybox
        }
        else {
          currentSkybox = new SkyBox({
            sources: this.skyBoxConfig[name],
            nearGround:true
          })
        }
      }
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
.skybox {
  position: absolute;
  top:5px;
  left: 5px;
  height: 30px;
  border-radius: 3px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
