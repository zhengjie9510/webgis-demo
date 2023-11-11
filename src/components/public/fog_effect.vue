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
        float getDistance(sampler2D depthTexture, vec2 texCoords) 
        { 
            float depth = czm_unpackDepth(texture(depthTexture, texCoords)); 
            if (depth == 0.0) { 
                return czm_infinity; 
            } 
            vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth); 
            return -eyeCoordinate.z / eyeCoordinate.w; 
        } 
        float interpolateByDistance(vec4 nearFarScalar, float distance) 
        { 
            float startDistance = nearFarScalar.x; 
            float startValue = nearFarScalar.y; 
            float endDistance = nearFarScalar.z; 
            float endValue = nearFarScalar.w; 
            float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0); 
            return mix(startValue, endValue, t); 
        } 
        vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor) 
        { 
            return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a); 
        } 
        uniform sampler2D colorTexture; 
        uniform sampler2D depthTexture; 
        uniform vec4 fogByDistance; 
        uniform vec4 fogColor; 
        in vec2 v_textureCoordinates; 
        out vec4 fragColor;
        void main(void) 
        { 
            float distance = getDistance(depthTexture, v_textureCoordinates); 
            vec4 sceneColor = texture(colorTexture, v_textureCoordinates); 
            float blendAmount = interpolateByDistance(fogByDistance, distance); 
            vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount); 
            fragColor = alphaBlend(finalFogColor, sceneColor); 
        }
        `;

      viewer.scene.postProcessStages.add(
        new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
          uniforms: {
            fogByDistance: new Cesium.Cartesian4(10, 0.0, 4000, 1.0),
            fogColor: new Cesium.Color(0.8, 0.8, 0.8, 1.0),
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
