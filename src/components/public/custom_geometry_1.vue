<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'


function fetchJSON(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error:', error);
    });
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

      fetchJSON(process.env.BASE_URL + 'SampleData/surface.json')
        .then(data => {
          let positions = new Float32Array(data.positions)
          let colors = new Uint8Array(data.colors)

          let attributes = new Cesium.GeometryAttributes({
            position: new Cesium.GeometryAttribute({
              componentDatatype: Cesium.ComponentDatatype.DOUBLE,
              componentsPerAttribute: 3,
              values: positions,
            }),
            color: new Cesium.GeometryAttribute({
              componentDatatype: Cesium.ComponentDatatype.FLOAT,
              componentsPerAttribute: 4,
              values: colors,
            }),
          })


          let indices = new Uint32Array(data.indices)

          let geometry = new Cesium.Geometry({
            attributes: attributes,
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
          })

          geometry = Cesium.GeometryPipeline.computeNormal(geometry)

          //模型矩阵
          let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(data.centroid.x, data.centroid.y)
          )

          //四面体的实例
          let instance = new Cesium.GeometryInstance({
            geometry: geometry,
            modelMatrix: modelMatrix,
          })

          function v_shader() {
            return `
            in vec3 position3DHigh;
            in vec3 position3DLow;
            in vec3 normal;
            in vec4 color;
            in float batchId;

            out vec3 v_positionEC;
            out vec3 v_normalEC;
            out vec4 v_color;

            void main()
            {
                vec4 p = czm_computePosition();

                v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                v_color = color;
                gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }`
          }

          function f_shader() {
            return `
            in vec4 v_color;
            czm_material czm_getMaterial(czm_materialInput materialInput)
            {
                czm_material material = czm_getDefaultMaterial(materialInput);
                material.diffuse = czm_gammaCorrect(1. - v_color.rgb/255.); 
                return material;
            }`
          }

          let appearance = new Cesium.MaterialAppearance({
            translucent: true,
            vertexShaderSource: v_shader(),
            material: new Cesium.Material({
              translucent: false,
              fabric: {
                type: 'MyColor',
                source: f_shader(),
              }
            }),
            materialSupport: Cesium.MaterialAppearance.MaterialSupport.BASIC,
            renderState: {
              blending: Cesium.BlendingState.ALPHA_BLEND, //使用Alpha混合功能启用混合
              depthTest: { enabled: true }, //深度检测
              depthMask: true, //将深度值写入深度缓冲区
            },
          })

          const primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: appearance,
            asynchronous: false,
          })

          viewer.scene.primitives.add(primitive)
          let center = Cesium.Cartesian3.fromDegrees(data.centroid.x, data.centroid.y)
          let radius = 5000
          viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, radius), { duration: 0 })
        });
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
