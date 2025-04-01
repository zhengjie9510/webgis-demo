<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

const road = require('../../../public/SampleData/road.json')

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const viewer = new Cesium.Viewer('cesiumContainer', {
        baseLayer: new Cesium.ImageryLayer(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              subdomains: ["a", "b", "c", "d"],
            })
        )
      });

      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        viewer.resolutionScale = window.devicePixelRatio;
      }
      viewer.scene.postProcessStages.fxaa.enabled = true;

      Cesium.GeoJsonDataSource.load(road).then(dataSource => {
        viewer.zoomTo(dataSource);
        // 提取实体
        const entities = dataSource.entities.values;

        const geometryInstances = [];
        entities.forEach(entity => {
          if (entity.polyline && entity.polyline.positions) {
            const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
            // 创建 Primitive 用于绘制线
            const geometryInstance = new Cesium.GeometryInstance({
              geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 2.0,
              })
            });

            geometryInstances.push(geometryInstance);
          }
        });

        const fragmentShaderSource = `
          uniform vec4 baseColor;   // 线的底色（全线可见）
          uniform vec4 glowColor;   // 流光颜色
          uniform float speed;      // 流光速度
          uniform float percent;    // 流光宽度百分比

          czm_material czm_getMaterial(czm_materialInput materialInput){
              czm_material material = czm_getDefaultMaterial(materialInput);
              vec2 st = materialInput.st;

              float t = fract(czm_frameNumber * speed / 1000.0);
              t *= (1.0 + percent);

              float glowAlpha = smoothstep(t - percent, t, st.s) * step(-t, -st.s);

              vec3 finalColor = baseColor.rgb * (1.0 - glowAlpha) + glowColor.rgb * glowAlpha;

              material.diffuse = finalColor;
              material.emission = glowColor.rgb * glowAlpha;

              return material;
          }
        `

        viewer.scene.primitives.add(
            new Cesium.Primitive({
              geometryInstances: geometryInstances,
              appearance: new Cesium.PolylineMaterialAppearance({
                material: new Cesium.Material({
                  fabric: {
                    uniforms: {
                      baseColor: new Cesium.Color.fromCssColorString('#26d7f4'),
                      glowColor: new Cesium.Color.fromCssColorString('#a3f68e'),
                      speed: 20.0,
                      percent: 0.4,
                    },
                    source: fragmentShaderSource
                  },
                }),
              }),
              allowPicking: false
            })
        )
      });
    }
  }
}
</script>
<style lang="scss" scoped>
#cesiumContainer {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
