<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  FeatureDetection,
  WallGeometry,
  Cartesian3,
  VertexFormat,
  GeometryInstance,
  Primitive,
  MaterialAppearance,
  Material,
  ColorGeometryInstanceAttribute,
  Color,
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

      // Example 1: Draw a red wall with constant min and max heights

      // Use the maximumHeight and minumumHeight options to specify
      // the heights of the top and bottom of the wall.
      var redWallInstance = new GeometryInstance({
        geometry: WallGeometry.fromConstantHeights({
          positions: Cartesian3.fromDegreesArray([-115.0, 44.0, -90.0, 44.0]),
          maximumHeight: 200000.0,
          minimumHeight: 100000.0,
          vertexFormat: VertexFormat.POSITION_AND_ST,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.RED),
        },
      })

      // Add red wall instances to primitives.
      var redWall = scene.primitives.add(
        new Primitive({
          geometryInstances: redWallInstance,
          appearance: new MaterialAppearance({
            material: new Material({
              fabric: {
                uniforms: {
                  color: new Color(1.0, 0.0, 0.0),
                  offset: 0.0,
                },
                source: `
                                    uniform vec4 color;
                                    uniform float offset;
                                    czm_material czm_getMaterial(czm_materialInput materialInput)
                                    {
                                        czm_material material = czm_getDefaultMaterial(materialInput);
                                        vec2 st = materialInput.st;
                                        material.diffuse = color.rgb;
                                        material.alpha = fract(1.0 - st.t + offset);
                                        material.emission=vec3(0.5);
                                        return material;
                                    }`,
              },
            }),
          }),
        })
      )

      // Example 2: Draw a green wall with constant height

      // If minumumHeight is not specified, the wall will be
      // drawn on the globe surface.
      var greenWallInstance = new GeometryInstance({
        geometry: WallGeometry.fromConstantHeights({
          positions: Cartesian3.fromDegreesArray([
            -107.0,
            43.0,
            -97.0,
            43.0,
            -97.0,
            40.0,
            -107.0,
            40.0,
            -107.0,
            43.0,
          ]),
          maximumHeight: 100000.0,
          vertexFormat: VertexFormat.POSITION_AND_ST,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.GREEN),
        },
      })

      // Add green wall instances to primitives.
      var greenWall = scene.primitives.add(
        new Primitive({
          geometryInstances: greenWallInstance,
          appearance: new MaterialAppearance({
            material: new Material({
              fabric: {
                uniforms: {
                  color: new Color(0.0, 1.0, 0.0),
                  offset: 0.0,
                },
                source: `
                                    uniform vec4 color;
                                    uniform float offset;
                                    czm_material czm_getMaterial(czm_materialInput materialInput)
                                    {
                                        czm_material material = czm_getDefaultMaterial(materialInput);
                                        vec2 st = materialInput.st;
                                        material.diffuse = color.rgb;
                                        material.alpha = fract(1.0 - st.t + offset);
                                        material.emission=vec3(0.5);
                                        return material;
                                    }`,
              },
            }),
          }),
        })
      )

      // Example 3: Draw a blue wall with per position heights
      // To use per position heights, create an array of heights
      // for maximumHeights (and optionally minumumHeights)
      // with a length equal to the number of positions.
      var positions = Cartesian3.fromDegreesArray([
        -115.0,
        50.0,
        -112.5,
        50.0,
        -110.0,
        50.0,
        -107.5,
        50.0,
        -105.0,
        50.0,
        -102.5,
        50.0,
        -100.0,
        50.0,
        -97.5,
        50.0,
        -95.0,
        50.0,
        -92.5,
        50.0,
        -90.0,
        50.0,
      ])
      var maximumHeights = [
        100000,
        200000,
        100000,
        200000,
        100000,
        200000,
        100000,
        200000,
        100000,
        200000,
        100000,
      ]
      var minimumHeights = [
        0,
        100000,
        0,
        100000,
        0,
        100000,
        0,
        100000,
        0,
        100000,
        0,
      ]

      var blueWallInstance = new GeometryInstance({
        geometry: new WallGeometry({
          positions: positions,
          maximumHeights: maximumHeights,
          minimumHeights: minimumHeights,
          vertexFormat: VertexFormat.POSITION_AND_ST,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.BLUE),
        },
      })

      // Add blue wall instances to primitives.
      var blueWall = scene.primitives.add(
        new Primitive({
          geometryInstances: blueWallInstance,
          appearance: new MaterialAppearance({
            material: new Material({
              fabric: {
                uniforms: {
                  color: new Color(0.0, 0.0, 1.0),
                  offset: 0.0,
                },
                source: `
                                    uniform vec4 color;
                                    uniform float offset;
                                    czm_material czm_getMaterial(czm_materialInput materialInput)
                                    {
                                        czm_material material = czm_getDefaultMaterial(materialInput);
                                        vec2 st = materialInput.st;
                                        material.diffuse = color.rgb;
                                        material.alpha = fract(1.0 - st.t + offset);
                                        material.emission=vec3(0.5);
                                        return material;
                                    }`,
              },
            }),
          }),
        })
      )

      // 动态修改雷达材质中的offset变量，从而实现动态效果。
      viewer.scene.preUpdate.addEventListener(function() {
        var redoffset = redWall.appearance.material.uniforms.offset
        redoffset += 0.01
        if (redoffset > 1.0) {
          redoffset = 0.0
        }
        redWall.appearance.material.uniforms.offset = redoffset

        var greenoffset = greenWall.appearance.material.uniforms.offset
        greenoffset += 0.01
        if (greenoffset > 1.0) {
          greenoffset = 0.0
        }
        greenWall.appearance.material.uniforms.offset = greenoffset

        var blueoffset = blueWall.appearance.material.uniforms.offset
        blueoffset += 0.01
        if (blueoffset > 1.0) {
          blueoffset = 0.0
        }
        blueWall.appearance.material.uniforms.offset = blueoffset
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
