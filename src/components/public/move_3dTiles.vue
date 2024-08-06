<template>
  <div class="map">
    <div id="cesiumContainer"></div>
    <div id="toolbar">
      <el-row justify="space-between">
        <el-input v-model="url" placeholder="Please input" style="width: 80%;" clearable>
          <template #prepend>URL</template>
        </el-input>
        <el-button type="primary" @click="handleButtonClick">Upload</el-button>
      </el-row>
      <span>X (度)</span>
      <el-slider v-model="data.x" :min="-0.1" :max="0.1" :step="0.00001" show-input>
      </el-slider>
      <span>Y (度)</span>
      <el-slider v-model="data.y" :min="-0.1" :max="0.1" :step="0.00001" show-input>
      </el-slider>
      <span>Z (米)</span>
      <el-slider v-model="data.z" :min="-500" :max="500" :step="1" show-input>
      </el-slider>
    </div>
  </div>
</template>

<script >
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

/** @type {Cesium.Viewer | undefined} */
let viewer = undefined;
/** @type {Cesium.Cesium3DTileset | undefined} */
let tileset = undefined;
export default {
  data() {
    return {
      path: process.env.BASE_URL,
      data: {
        x: 0,
        y: 0,
        z: 0,
        dir: 0,
        p: 0,
        r: 0
      },
      url: ""
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: await Cesium.createWorldTerrainAsync()
      })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true

      this.url = this.path + 'SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json'
      tileset = await Cesium.Cesium3DTileset.fromUrl(this.url)
      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 2.0))
    },

    /**
     * 调整模型位置
     * @param {Cesium.Cesium3DTileset} tileset 需要调整的模型
     * @param {Object} data 模型姿态数据
     */
    adjust3DTiles(tileset, data) {
      const cartographic = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      );
      const origin = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height
      )
      const offset = Cesium.Cartesian3.fromRadians(
        cartographic.longitude + data.x * Math.PI / 180,
        cartographic.latitude + data.y * Math.PI / 180,
        cartographic.height + data.z
      )
      const translation = Cesium.Cartesian3.subtract(
        offset,
        origin,
        new Cesium.Cartesian3()
      );
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
    },

    /**
     * 处理按钮点击，重新加载模型
     */
    async handleButtonClick() {
      viewer.scene.primitives.removeAll()
      tileset = await Cesium.Cesium3DTileset.fromUrl(this.url)
      viewer.scene.primitives.add(tileset)
      viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 2.0))
    }
  },
  watch: {
    data: {
      handler() {
        this.adjust3DTiles(tileset, this.data)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.map {
  position: absolute;
  height: 100%;
  width: 100%;

  #cesiumContainer {
    position: absolute;
    height: 100%;
    width: 100%;
  }

  #toolbar {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 400px;
    background: rgba(42, 42, 42, 0.8);
    padding: 20px;
    border-radius: 4px;
    color: white;
  }
}
</style>
