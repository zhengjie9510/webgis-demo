<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
// 定义材质 结束
export default {
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
      const fragmentShaderSource = `
        uniform vec4 color;
        uniform float speed;
        uniform float percent;
        uniform float gradient;
        
        czm_material czm_getMaterial(czm_materialInput materialInput){
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;
          float t = fract(czm_frameNumber * speed / 1000.0);
          t *= (1.0 + percent);
          float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
          alpha += gradient;
          material.diffuse = color.rgb;
          material.alpha = alpha;
          material.emission = vec3(0.7);
          return material;
        }
        `
      viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: this.generateRandomLines([104.065, 30.659], 100),
          appearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
              fabric: {
                uniforms: {
                  color: new Cesium.Color(1.0, 0.5, 0.0, 0.5),
                  speed: 5.0,
                  percent: 0.2,
                  gradient: 0.00
                },
                source: fragmentShaderSource
              },
            }),
          }),
          allowPicking: false
        })
      )
      const center = Cesium.Cartesian3.fromDegrees(104.065, 30.659);
      viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -10000.0, 3930.0));
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    },
    /**
     * @description: 产生随机线
     * @param center：中心点坐标
     * @param num：随机线数量
     * @return 返回线
     */
    generateRandomLines: function (center, num) {
      let geometryInstances = []
      for (let i = 0; i < num; i++) {
        let lon = center[0] + (Math.random() - 0.5) * 0.1;
        let lat = center[1] + (Math.random() - 0.5) * 0.1;
        const geometry = new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            lon, lat, 0, lon, lat, 5000 * Math.random()
          ]),
          width: 1.0,
        })
        const instance = new Cesium.GeometryInstance({ geometry: geometry })
        geometryInstances.push(instance)
      }
      return geometryInstances
    }
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
