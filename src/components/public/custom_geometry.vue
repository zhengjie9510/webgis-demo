<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  FeatureDetection,
  Cartesian3,
  GeometryInstance,
  Primitive,
  BlendingState,
  GeometryAttributes,
  PrimitiveType,
  GeometryAttribute,
  Transforms,
  ComponentDatatype,
  Geometry,
  BoundingSphere,
  Appearance,
  Matrix4,
  Math as CesiumMath
} from 'cesium'
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var viewer = new Viewer('cesiumContainer')
      if (FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      var scene = viewer.scene

      // Create a cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      var vertices = new Float32Array([
        // Vertex coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, // v4-v7-v6-v5 back
      ])

      var colors = new Float32Array([
        // Colors
        0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, // v0-v1-v2-v3 front(blue)
        0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, // v0-v3-v4-v5 right(green)
        1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, // v0-v5-v6-v1 up(red)
        1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, // v1-v6-v7-v2 left
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v7-v4-v3-v2 down
        0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, // v4-v7-v6-v5 back
      ])

      var attributes = new GeometryAttributes({
        position: new GeometryAttribute({
          componentDatatype: ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: vertices,
        }),
        color: new GeometryAttribute({
          componentDatatype: ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: colors,
        }),
      })

      var indices = new Uint8Array([
        // Indices of the vertices
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23, // back
      ])

      //包围球
      var boundingSphere = new BoundingSphere(
        new Cartesian3(0.0, 0.0, 0.0),
        2.0
      )

      var geometry = new Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingSphere: boundingSphere,
      })

      //模型矩阵
      var modelMatrix = Matrix4.multiplyByUniformScale(
        Matrix4.multiplyByTranslation(
          Transforms.eastNorthUpToFixedFrame(
            Cartesian3.fromDegrees(116.23, 39.54)
          ),
          new Cartesian3(0.0, 0.0, 25),
          new Matrix4()
        ),
        25.0,
        new Matrix4()
      )
      //四面体的实例
      var instance = new GeometryInstance({
        geometry: geometry,
        modelMatrix: modelMatrix,
      })
      function v_shader() {
        return `
          in vec3 position3DHigh;
          in vec3 position3DLow;
          in float batchId;
          in vec4 color;
          out vec4 v_color;
          void main() {
              vec4 position = czm_modelViewProjectionRelativeToEye *czm_computePosition();
              v_color = color;
              gl_Position = position;
          }`
      }
      function f_shader() {
        return `
          in vec4 v_color;
          void main() {
              vec4 color = czm_gammaCorrect(v_color);
              out_FragColor = color;
          }`
      }
      let appearance = new Appearance({
        translucent: false, //显示不为半透明
        closed: true,
        renderState: {
          blending: BlendingState.PRE_MULTIPLIED_ALPHA_BLEND, //使用Alpha混合功能启用混合
          depthTest: { enabled: true }, //深度检测
          depthMask: true, //将深度值写入深度缓冲区
        },
        fragmentShaderSource: f_shader(), //片段着色器
        vertexShaderSource: v_shader(), //顶点着色器
      })
      //加入场景
      scene.primitives.add(
        new Primitive({
          geometryInstances: instance,
          appearance: appearance,
          asynchronous: false,
        })
      )
      //
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(116.23, 39.54, 500),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-90),
          roll: 0.0,
        },
      })
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
