<template>
  <div id="cesiumContainer">
    <div class="mvt-info" v-if="featureInfo">
      <div class="info-title">要素信息</div>
      <div
        v-for="item in featureInfo"
        :key="item.key"
        class="info-row"
      >
        <span class="info-key">{{ item.key }}</span>
        <span class="info-value">{{ formatValue(item.value) }}</span>
      </div>
    </div>

    <div class="mvt-tip">
      MVT 矢量瓦片：点击地图中的要素查看属性
    </div>
  </div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

export default {
  data() {
    return {
      featureInfo: null
    }
  },

  mounted() {
    this.init()
  },

  beforeUnmount() {
    if (this._handler && !this._handler.isDestroyed()) {
      this._handler.destroy()
    }

    if (this._viewer && !this._viewer.isDestroyed()) {
      this._viewer.destroy()
    }
  },

  methods: {
    async init() {
      try {
        // 1. 初始化 Cesium
        //    ArcGIS World Imagery 卫星影像，公开服务，无需 token
        const viewer = new Cesium.Viewer('cesiumContainer', {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          baseLayer: new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              maximumLevel: 19,
              credit: 'Tiles © Esri'
            })
          )
        })

        this._viewer = viewer

        viewer.scene.postProcessStages.fxaa.enabled = true

        // 2. 设置相机位置：北京
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(116.38, 39.9, 200000)
        })

        // 3. MVT 数据地址（OpenFreeMap，无需 token）
        const mvtUrl =
          'https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf'

        // 4. 创建 MVTDataProvider（Cesium 1.142+ 实验特性）
        const provider = await Cesium.MVTDataProvider.fromUrl(mvtUrl, {
          minZoom: 4,
          maxZoom: 12,
          // 限制数据覆盖范围：北京附近
          extent: Cesium.Rectangle.fromDegrees(115.5, 39.4, 117.3, 40.5)
        })

        this._mvtProvider = provider

        // 值越大加载的瓦片越少，牺牲细节换取流畅度
        provider.tileset.maximumScreenSpaceError = 32

        // 5. 设置 MVT 样式
        //    隐藏 landcover/landuse/park 等大面积面图层，避免盖住卫星底图
        provider.tileset.style = new Cesium.Cesium3DTileStyle({
          show: {
            conditions: [
              ["${_layer} === 'landcover'", "false"],
              ["${_layer} === 'landuse'", "false"],
              ["${_layer} === 'park'", "true"],
              ["true", "true"]
            ]
          },

          color: {
            conditions: [
              ["${_layer} === 'water'", "color('#3d9be9')"],
              ["${_layer} === 'waterway'", "color('#3d9be9')"],
              ["${_layer} === 'transportation'", "color('#ffd166')"],
              ["${_layer} === 'transportation_name'", "color('#ffffff')"],
              ["${_layer} === 'boundary'", "color('#ff5e5e')"],
              ["true", "color('#00d8ff')"]
            ]
          },

          // 点大小
          pointSize: 6.0,

          // 点描边
          pointOutlineColor: "color('#ffffff')",
          pointOutlineWidth: 1.0,

          // 线宽
          lineWidth: 2.0
        })

        // 6. 添加到 Cesium 场景
        viewer.scene.primitives.add(provider)

        // 7. 监听瓦片加载
        provider.tileset.tileFailed.addEventListener((error) => {
          console.error('MVT 瓦片加载失败:', error)
        })

        // 8. 点击获取 MVT Feature 属性
        this.addPickEvent(viewer)

        console.log('MVT 加载成功', provider)
      } catch (error) {
        console.error('MVT 初始化失败:', error)
      }
    },

    // 点击拾取
    addPickEvent(viewer) {
      const handler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene.canvas
      )

      this._handler = handler

      handler.setInputAction((movement) => {
        const picked = viewer.scene.pick(movement.position)

        // MVT 矢量要素拾取返回 Cesium3DTileVectorFeature
        if (
          !Cesium.defined(picked) ||
          typeof picked.getPropertyIds !== 'function'
        ) {
          this.featureInfo = null
          return
        }

        // 获取 Feature 所有属性，过滤掉 NaN 和空值
        const propertyIds = picked.getPropertyIds()

        const info = propertyIds
          .map((key) => {
            return {
              key,
              value: picked.getProperty(key)
            }
          })
          .filter((item) => !this.isEmptyValue(item.value))

        this.featureInfo = info.length > 0 ? info : null

        console.log('当前点击的 MVT Feature:', picked)
        console.log('Feature 属性:', this.featureInfo)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },

    // NaN、空字符串、空数组/对象等视为空值
    isEmptyValue(value) {
      if (value === undefined || value === null) {
        return true
      }
      if (typeof value === 'number' && Number.isNaN(value)) {
        return true
      }
      if (typeof value === 'string') {
        const text = value.trim()
        return text === '' || text.toLowerCase() === 'nan'
      }
      if (Array.isArray(value)) {
        return value.length === 0
      }
      if (typeof value === 'object') {
        return Object.keys(value).length === 0
      }
      return false
    },

    // 属性值可能是对象或数组，统一转成可读文本
    formatValue(value) {
      if (value === undefined || value === null) {
        return ''
      }
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    }
  }
}
</script>

<style lang="scss" scoped>
#cesiumContainer {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

.mvt-info {
  position: absolute;
  z-index: 100;
  right: 20px;
  top: 20px;
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: rgba(20, 30, 45, 0.9);
  color: white;
  border-radius: 6px;
}

.info-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 12px;
  word-break: break-all;
}

.info-key {
  flex: none;
  color: #7fd8ff;
}

.info-value {
  text-align: right;
}

.mvt-tip {
  position: absolute;
  z-index: 100;
  bottom: 25px;
  left: 20px;
  padding: 10px 15px;
  color: white;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 4px;
}
</style>
