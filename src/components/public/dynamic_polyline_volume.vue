<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  Math as CesiumMath,
  FeatureDetection,
  Cartesian3,
  MaterialAppearance,
  Cartesian2,
  GeometryInstance,
  Primitive,
  Material,
  Color,
  PolylineVolumeGeometry,
  VertexFormat,
  CornerType,
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

      // Example 1: Draw a red tube on the globe surface.

      // Create positions for a 2D circle.
      function computeCircle(radius) {
        var positions = []
        for (var i = 0; i < 360; i++) {
          var radians = CesiumMath.toRadians(i)
          positions.push(
            new Cartesian2(
              radius * Math.cos(radians),
              radius * Math.sin(radians)
            )
          )
        }
        return positions
      }
      // Create the polyline volume geometry instance.  The shape defined by the
      // shapePositions option will be extruded along the polylinePositions.
      var geometry = new PolylineVolumeGeometry({
        polylinePositions: Cartesian3.fromDegreesArray([
          -85.0,
          32.0,
          -85.0,
          36.0,
          -89.0,
          36.0,
        ]),
        vertexFormat: VertexFormat.POSITION_NORMAL_AND_ST,
        shapePositions: computeCircle(6000.0),
        cornerType: CornerType.MITERED,
      })

      // Add all instances to primitives.
      var primitive = scene.primitives.add(
        new Primitive({
          geometryInstances: new GeometryInstance({
            geometry: geometry,
          }),
          appearance: new MaterialAppearance({
            material: new Material({
              fabric: {
                uniforms: {
                  color: new Color(1.0, 0.0, 0.0, 1.0),
                  percentage: 0.1,
                  offset: 0.0,
                },
                source: `
                  uniform vec4 color;
                  uniform float percentage;
                  uniform float offset;
                  czm_material czm_getMaterial(czm_materialInput materialInput)
                  {
                      czm_material material = czm_getDefaultMaterial(materialInput);
                      vec2 st = materialInput.st;
                      material.diffuse = color.rgb;
                      material.alpha = 1.0-mod(st.s+offset,percentage)*(1.0/percentage);
                      return material;
                  }`,
              },
            }),
          }),
        })
      )

      viewer.camera.flyToBoundingSphere(
        PolylineVolumeGeometry.createGeometry(geometry).boundingSphere
      )

      viewer.scene.preUpdate.addEventListener(function() {
        var offset = primitive.appearance.material.uniforms.offset
        offset += 0.001
        if (offset > 1.0) {
          offset = 0.0
        }
        primitive.appearance.material.uniforms.offset = offset
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
