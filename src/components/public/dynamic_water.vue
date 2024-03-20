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
      viewer.scene.globe.depthTestAgainstTerrain = true

      viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(
                103.30, 29.25,
                103.45, 29.35
              ),
              height: 1000 - 470,
              vertexFormat: Cesium.VertexFormat.DEFAULT,
            }),
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
              fabric: {
                type: "Water",
                uniforms: {
                  baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 200 / 255.0, 0.5),
                  normalMap: Cesium.buildModuleUrl("Assets/Textures/waterNormals.jpg"),
                  frequency: 1000.0,
                  animationSpeed: 0.1,
                  amplitude: 10,
                  specularIntensity: 10
                }
              }
            })
          }),
        })
      );
      const center = Cesium.Cartesian3.fromDegrees(103.37, 29.15);
      viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, -47900.0, 39300.0));
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
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
