<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
const borderJson = require('../../../public/SampleData/sichuan.json')

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var viewer = new Cesium.Viewer('cesiumContainer', {
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

      for (const feature of borderJson.features) {
        const coordinates = feature.geometry.coordinates

        let geometry = new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray(coordinates.flat(2)),
          width: 10.0
        })

        const instance = new Cesium.GeometryInstance({
          geometry: geometry
        })
        const glowBorder = new Cesium.Primitive({
          geometryInstances: instance,
          appearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
              fabric: {
                type: 'MyBorderColor',
                uniforms: {
                  color: new Cesium.Color(0.8, 0.2, 0.5, 1.0),
                  glowPower: 0.25,
                  taperPower: 1
                },
                source: `
                  uniform vec4 color;
                  uniform float glowPower;
                  uniform float taperPower;
                  czm_material czm_getMaterial(czm_materialInput materialInput)
                  {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    vec2 st = materialInput.st;
                    float glow = glowPower / abs(st.t - 0.5) - (glowPower / 0.5);

                    if (taperPower <= 0.99999) {
                        glow *= min(1.0, taperPower / (0.5 - st.s * 0.5) - (taperPower / 0.5));
                    }

                    vec4 fragColor;
                    fragColor.rgb = max(vec3(glow - 1.0 + color.rgb), color.rgb);
                    fragColor.a = clamp(0.0, 1.0, glow) * color.a;
                    fragColor = czm_gammaCorrect(fragColor);

                    material.emission = fragColor.rgb;
                    material.alpha = fragColor.a;

                    return material;
                  }
                `
              }
            })
          }),
          allowPicking: false
        })
        viewer.scene.primitives.add(glowBorder)

        geometry = Cesium.PolylineGeometry.createGeometry(geometry)
        viewer.camera.flyToBoundingSphere(geometry.boundingSphere, { duration: 0 })
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
