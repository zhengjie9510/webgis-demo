<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

class TrianglePrimitive {
  /**
   * @param {Cesium.Matrix4} modelMatrix matrix to WorldCoordinateSystem
   */
  constructor(modelMatrix) {
    this._modelMatrix = modelMatrix
  }

  /**
   * Creates a vertex array for rendering the CPU wind.
   * @param {Cesium.Context} context - The Cesium rendering context.
   * @returns {Cesium.VertexArray} The created vertex array.
   */
  createVertexArray(context) {

    const positions = new Float32Array([
      10000, 50000, 5000,
      -20000, -10000, 5000,
      50000, -30000, 5000,
    ])
    const geometry = new Cesium.Geometry({
      attributes: {
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: positions,
        }),
      },
      indices: [0, 1, 2],
      primitiveType: Cesium.PrimitiveType.LINES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
    })

    const vertexArray = Cesium.VertexArray.fromGeometry({
      context: context,
      geometry: geometry,
      attributeLocations: {
        position: 0,
      },
      bufferUsage: Cesium.BufferUsage.STATIC_DRAW
    })

    return vertexArray
  }

  /**
   * Creates a draw command for rendering the CPU wind.
   * @param {Cesium.Context} context - The Cesium rendering context.
   * @returns {Cesium.ShaderProgram} The created shader program.
   */
  /**
   * Creates a draw command for rendering the CPU wind.
   * @param {Cesium.Context} context - The Cesium rendering context.
   */
  createShaderProgram(context) {
    const attributeLocations = {
      "position": 0,
    }

    const vertexShaderText = `
      in vec3 position;
      void main() {
          vec4 position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
          gl_PointSize = 10.0;
          gl_Position = position;
      }
      `
    const fragmentShaderText = `
      uniform vec3 u_color;
      void main() {
          out_FragColor =  vec4(u_color, 1.0);
      }
      `
    const program = Cesium.ShaderProgram.fromCache({
      context: context,
      vertexShaderSource: vertexShaderText,
      fragmentShaderSource: fragmentShaderText,
      attributeLocations: attributeLocations,
    })
    return program
  }

  /**
   * Creates a draw command for rendering CPU wind.
   * @param {Object} context - The context object.
   * @returns {Cesium.DrawCommand} - The draw command.
   */
  createCommand(context) {
    const vertexArray = this.createVertexArray(context)
    const program = this.createShaderProgram(context)
    const renderState = Cesium.RenderState.fromCache({
      depthTest: {
        enabled: true
      }
    })
    const uniformMap = {
      u_color() {
        return Cesium.Color.RED
      },
    }
    const command = new Cesium.DrawCommand({
      modelMatrix: this._modelMatrix,
      vertexArray: vertexArray,
      shaderProgram: program,
      uniformMap: uniformMap,
      renderState: renderState,
      pass: Cesium.Pass.OPAQUE,
    })
    return command
  }

  /**
   * @param {Cesium.FrameState} frameState
   */
  update(frameState) {
    const command = this.createCommand(frameState.context)
    frameState.commandList.push(command)
  }
}

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
      viewer.scene.globe.depthTestAgainstTerrain = true

      const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter)
      viewer.scene.primitives.add(new TrianglePrimitive(modelMatrix))
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(112, 23, 200000),
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
