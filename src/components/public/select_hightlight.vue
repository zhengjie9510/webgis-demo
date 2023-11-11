<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

export default {
  data() {
    return { path: process.env.BASE_URL }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      var viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true;

      const tileset = await Cesium.Cesium3DTileset.fromUrl(this.path + 'SampleData/Cesium3DTiles/Tilesets/Tileset/tileset.json')
      viewer.scene.primitives.add(tileset)
      tileset.style = new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${Height} >= 83", "color('purple')"],
            ["${Height} >= 80", "color('red')"],
            ["${Height} >= 70", "color('orange')"],
            ["${Height} >= 12", "color('yellow')"],
            ["${Height} >= 7", "color('lime')"],
            ["${Height} >= 1", "color('DARKORANGE')"],
            ["true", "color('blue')"],
          ],
        },
      });
      viewer.zoomTo(tileset);
      const highlighted = {
        primitive: undefined,
        originalColor: new Cesium.Color(),
      }
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click) => {
        const pickobject = viewer.scene.pick(click.position);
        // step1 恢复已高亮的primitie颜色
        if (highlighted.primitive) {
          highlighted.primitive.color = highlighted.originColor
          highlighted.primitive = undefined
          highlighted.originColor = undefined
        }
        // step2 对选中的primitive改变颜色
        if (Cesium.defined(pickobject)) {
          highlighted.primitive = pickobject
          highlighted.originColor = Cesium.Color.clone(pickobject.color)
          pickobject.color = Cesium.Color.CYAN
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
</style>
