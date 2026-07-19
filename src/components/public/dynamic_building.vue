<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  FeatureDetection,
  MaterialAppearance,
  GeometryInstance,
  Primitive,
  Material,
  Color,
  GeoJsonDataSource,
  Cartesian3,
  Matrix4
} from 'cesium'
import { default as PolygonGeometry } from './plugins/PolygonGeometry'
const building = require('../../../public/SampleData/building.json')

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
      const scene = viewer.scene

      const fragmentShaderSource = `
        uniform float offset2;
        uniform float offset1;
        uniform vec4 color;
        const float pi = 3.1415926;
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;

          material.diffuse = czm_gammaCorrect(color.rgb); 
          // material.diffuse = vec3(st.t,st.t,st.t);
          float a = abs(cos(st.t * pi * 3.0));
          if(a<=0.2){
            material.diffuse = vec3(189.0/255.0,196.0/255.0,210.0/255.0);
          }
          if(st.t> offset1-offset2 && st.t< offset1+offset2)
          {
            material.emission=vec3(0.7);
          }
          material.alpha = 1.0; 
          return material;
        }
        `

      GeoJsonDataSource.load(building).then((dataSource) => {
        const entities = dataSource.entities.values
        const geometryInstances = []
        for (const entity of entities) {
          const polygon = new PolygonGeometry({
            polygonHierarchy: entity.polygon.hierarchy.getValue(),
            extrudedHeight: Math.random() * 40 + 10,
          })
          const geometry = PolygonGeometry.createGeometry(polygon)
          const geometryInstance = new GeometryInstance({
            geometry: geometry,
          })
          geometryInstances.push(geometryInstance)
        }
        const primitive = scene.primitives.add(
          new Primitive({
            asynchronous: false,
            geometryInstances: geometryInstances,
            appearance: new MaterialAppearance({
              material: new Material({
                translucent: false,
                fabric: {
                  uniforms: {
                    color: new Color(87 / 255, 122 / 255, 150 / 255),
                    offset1: 0.02,
                    offset2: 0.02,
                  },
                  source: fragmentShaderSource
                },
              }),
            }),
          })
        )

        // 动态修改材质中的offset变量，从而实现动态效果。
        viewer.scene.preUpdate.addEventListener(function () {
          var offset = primitive.appearance.material.uniforms.offset1
          offset += 0.01
          if (offset > 0.98) {
            offset = 0.02
          }
          primitive.appearance.material.uniforms.offset1 = offset
        })
        const center = Cartesian3.fromDegrees(104.06, 30.66);
        viewer.camera.lookAt(center, new Cartesian3(0.0, -4790.0, 3930.0));
        viewer.camera.lookAtTransform(Matrix4.IDENTITY);
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
