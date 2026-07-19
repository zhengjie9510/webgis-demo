<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var viewer = new Cesium.Viewer('cesiumContainer', { terrainProvider: Cesium.createWorldTerrain() })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.primitives.add(Cesium.createOsmBuildings());

      const fragmentShaderSource = `
        uniform vec4 color;
        uniform float percent;
        uniform float offset;
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
          czm_material material = czm_getDefaultMaterial(materialInput);
          material.diffuse = czm_gammaCorrect(color.rgb); 
          vec2 st = materialInput.st;
          float s = distance(st,vec2(0.5,0.5));
          float a = s-mod(offset,0.5);
          float l = 0.5*percent;
          if(a < l && a > 0.0){
              material.alpha = a/l;
          }
          else{
              material.alpha = 0.0;
          }
          material.emission=vec3(0.5);
          return material;
        } 
      `

      // Create the circle geometry.
      var circleGeometry = new Cesium.CircleGeometry({
        center: Cesium.Cartesian3.fromDegrees(-74.02, 40.69),
        radius: 200.0,
        vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
      })
      var instance = new Cesium.GeometryInstance({
        geometry: circleGeometry,
      })
      const appearance = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          translucent: false,
          fabric: {
            uniforms: {
              color: new Cesium.Color(0.0, 1.0, 0.0),
              percent: 0.05,
              offset: 0.0,
            },
            source: fragmentShaderSource
          },
        }),
      })
      var primitive = viewer.scene.primitives.add(
        new Cesium.GroundPrimitive({
          geometryInstances: instance,
          appearance: appearance
        })
      )
      viewer.scene.preUpdate.addEventListener(function () {
        var offset = primitive.appearance.material.uniforms.offset
        offset += 0.005
        primitive.appearance.material.uniforms.offset = offset
      })
      viewer.camera.flyToBoundingSphere(
        Cesium.CircleGeometry.createGeometry(circleGeometry).boundingSphere
      )
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
