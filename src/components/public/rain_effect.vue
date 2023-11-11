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
    async init() {
      var viewer = new Cesium.Viewer('cesiumContainer', { terrainProvider: await Cesium.createWorldTerrainAsync() })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(108.4175, 30.655, 1000),
        point: {}
      })
      viewer.zoomTo(entity)
      const fragmentShaderSource = `
        in vec2 v_textureCoordinates;
        uniform sampler2D colorTexture;
        uniform float tiltAngle;
        uniform float rainSize;
        uniform float rainSpeed;
        out vec4 fragColor;
        float hash(float x) {
            return fract(sin(x * 133.3) * 13.13);
        }
        void main(void) {
            float time = czm_frameNumber / rainSpeed;
            vec2 resolution = czm_viewport.zw;
            vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
            vec3 c = vec3(.6, .7, .8);
            float a = tiltAngle;
            float si = sin(a), co = cos(a);
            uv *= mat2(co, -si, si, co);
            uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;
            float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);
            float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;
            c *= v * b;
            fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1), .5);
        }
        `;

      viewer.scene.postProcessStages.add(
        new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
          uniforms: {
            tiltAngle: -.3, //倾斜角度
            rainSize: 0.5, //雨大小
            rainSpeed: 120.0 //雨速
          },
        })
      );
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
