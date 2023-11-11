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
    init() {
      var viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true;

      // Draw different instances each with a unique color
      const rectangleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(-140.0, 30.0, -100.0, 40.0),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        }),
        id: 'rectangle',
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute(1.0, 1.0, 1.0, 0.5)
        }
      });
      const ellipsoidInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipsoidGeometry({
          radii: new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
          vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
        }),
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(-95.59777, 40.03883)), new Cesium.Cartesian3(0.0, 0.0, 500000.0), new Cesium.Matrix4()),
        id: 'ellipsoid',
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
        }
      });
      viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: [rectangleInstance, ellipsoidInstance],
        appearance: new Cesium.PerInstanceColorAppearance()
      }));

      // 处理选中事件
      let handler = undefined
      let highlighted = { primitive: undefined, originColor: undefined, id: undefined } // 高亮
      if (!handler) {
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click) => {
          const pickobject = viewer.scene.pick(click.position)
          // step1 恢复已高亮的primitie颜色
          if (highlighted.primitive) {
            const attributes = highlighted.primitive.getGeometryInstanceAttributes(highlighted.id)
            attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(highlighted.originColor)
            highlighted.primitive = undefined
            highlighted.originColor = undefined
            highlighted.id = undefined
          }
          // step2 对选中的primitive改变颜色
          if (Cesium.defined(pickobject) && viewer.scene.primitives.contains(pickobject.primitive)) {
            const primitive = pickobject.primitive
            const id = pickobject.id
            const attributes = primitive.getGeometryInstanceAttributes(id)

            highlighted.primitive = primitive
            highlighted.originColor = Cesium.Color.fromBytes(...attributes.color)
            highlighted.id = id

            attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.RED)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }
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
