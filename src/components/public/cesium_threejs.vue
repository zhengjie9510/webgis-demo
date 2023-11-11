<template>
  <div class="container">
    <div id="cesiumContainer"></div>
    <canvas id="threeContainer"></canvas>
  </div>
</template>

//
<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  ShadowMode,
  Cartesian3,
  Math as CesiumMath,
  Color,
} from 'cesium'
import * as THREE from 'three'

const cesium = {
  viewer: null,
}
const three = {
  renderer: null,
  camera: null,
  scene: null,
}
// boundaries in WGS84 around the object
let minWGS84 = [115.23, 39.55]
let maxWGS84 = [116.23, 41.55]

const _3Dobjects = []
function _3DObject() {
  this.threeMesh = null //Three.js 3DObject.mesh
  this.minWGS84 = null //location bounding box
  this.maxWGS84 = null
}

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.initCesium()
      this.initThreejs()
      this.init3DObject()
      this.startRenderLoop()
    },
    initCesium() {
      cesium.viewer = new Viewer('cesiumContainer', {
        useDefaultRenderLoop: false,
        selectionIndicator: false,
        infoBox: false,
        navigationInstructionsInitiallyVisible: false,
        fullscreenButton: false,
        allowTextureFilterAnisotropic: false,
        contextOptions: {
          webgl: {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false,
            depth: true,
            stencil: false,
            anialias: false,
          },
        },
        targetFrameRate: 60,
        resolutionScale: 0.1,
        orderIndependentTranslucency: true,
        imageryProvider: undefined,
        baseLayerPicker: false,
        automaticallyTrackDataSourceClocks: false,
        dataSources: null,
        clock: null,
        terrainShadows: ShadowMode.DISABLED,
      })
      const center = Cartesian3.fromDegrees(
        (minWGS84[0] + maxWGS84[0]) / 2,
        (minWGS84[1] + maxWGS84[1]) / 2 - 1,
        200000
      )
      cesium.viewer.camera.flyTo({
        destination: center,
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-60),
          roll: CesiumMath.toRadians(0),
        },
        duration: 3,
      })
    },
    initThreejs() {
      const canvas = document.querySelector('#threeContainer')
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        logarithmicDepthBuffer: true,
        antialias: true,
      })

      var fov = 45
      var width = canvas.clientWidth
      var height = canvas.clientHeight
      var aspect = width / height
      var near = 1
      var far = 10 * 1000 * 1000
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

      const scene = new THREE.Scene()

      three.renderer = renderer
      three.scene = scene
      three.camera = camera
    },
    init3DObject() {
      // Cesium entity
      const entity = {
        name: 'Polygon',
        polygon: {
          hierarchy: Cartesian3.fromDegreesArray([
            minWGS84[0],
            minWGS84[1],
            maxWGS84[0],
            minWGS84[1],
            maxWGS84[0],
            maxWGS84[1],
            minWGS84[0],
            maxWGS84[1],
          ]),
          material: Color.RED.withAlpha(0.2),
        },
      }
      cesium.viewer.entities.add(entity)
      //Three.js Objects
      /**
       *  three的坐标系（右手坐标系），关键数据结构 Vector3
       *    Y
       *    |
       *    |___ X
       *   /
       * Z
       *
       * Cesium的坐标系，关键数据结构 Cartesian3
       *    Z
       *    |
       *    |__ Y
       *   /
       * X
       *
       */
      // 在three的坐标系空间里，先向Z轴平移模型，然后绕X轴向上翻转90度，物体就面向Y轴了，对应Cesiumn的Z轴
      // Lathe geometry
      var doubleSideMaterial = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
      })
      var segments = 10
      var points = []
      for (var i = 0; i < segments; i++) {
        points.push(
          new THREE.Vector2(Math.sin(i * 0.2) * segments + 5, (i - 5) * 2)
        )
      }
      var geometry = new THREE.LatheGeometry(points)
      var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial)
      latheMesh.scale.set(1500, 1500, 1500) //scale object to be visible at planet scale
      latheMesh.position.z += 15000 // translate "up" in Three.js space so the "bottom" of the mesh is the handle
      latheMesh.rotation.x = Math.PI / 2 // rotate mesh for Cesium's Y-up system
      var latheMeshYup = new THREE.Group()
      latheMeshYup.add(latheMesh)
      three.scene.add(latheMeshYup) // don’t forget to add it to the Three.js scene manually

      //Assign Three.js object mesh to our object array
      var _3DOB = new _3DObject()
      _3DOB.threeMesh = latheMeshYup
      _3DOB.minWGS84 = minWGS84
      _3DOB.maxWGS84 = maxWGS84
      _3Dobjects.push(_3DOB)

      // dodecahedron
      geometry = new THREE.DodecahedronGeometry()
      var dodecahedronMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshNormalMaterial()
      )
      dodecahedronMesh.scale.set(10000, 10000, 10000) //scale object to be visible at planet scale
      dodecahedronMesh.position.z += 10000 // translate "up" in Three.js space so the "bottom" of the mesh is the handle
      dodecahedronMesh.rotation.x = Math.PI / 2 // rotate mesh for Cesium's Y-up system
      var dodecahedronMeshYup = new THREE.Group()
      dodecahedronMeshYup.add(dodecahedronMesh)
      three.scene.add(dodecahedronMeshYup) // don’t forget to add it to the Three.js scene manually

      //Assign Three.js object mesh to our object array
      _3DOB = new _3DObject()
      _3DOB.threeMesh = dodecahedronMeshYup
      _3DOB.minWGS84 = minWGS84
      _3DOB.maxWGS84 = maxWGS84
      _3Dobjects.push(_3DOB)

      // Configure Three.js meshes to stand against globe center position up direction
      for (const id in _3Dobjects) {
        minWGS84 = _3Dobjects[id].minWGS84
        maxWGS84 = _3Dobjects[id].maxWGS84
        // convert lat/long center position to Cartesian3
        const center = Cartesian3.fromDegrees(
          (minWGS84[0] + maxWGS84[0]) / 2,
          (minWGS84[1] + maxWGS84[1]) / 2
        )

        // get forward direction for orienting model
        const centerHigh = Cartesian3.fromDegrees(
          (minWGS84[0] + maxWGS84[0]) / 2,
          (minWGS84[1] + maxWGS84[1]) / 2,
          1
        )

        // use direction from bottom left to top left as up-vector

        // configure entity position and orientation
        _3Dobjects[id].threeMesh.position.copy(center)
        _3Dobjects[id].threeMesh.lookAt(
          centerHigh.x,
          centerHigh.y,
          centerHigh.z
        )
      }
    },
    threeRender() {
      // Clone Cesium Camera projection position so the
      // Three.js Object will appear to be at the same place as above the Cesium Globe
      three.camera.matrixAutoUpdate = false
      const cvm = cesium.viewer.camera.viewMatrix
      const civm = cesium.viewer.camera.inverseViewMatrix

      three.camera.lookAt(0, 0, 0)
      three.camera.matrixWorld.set(
        civm[0],
        civm[4],
        civm[8],
        civm[12],
        civm[1],
        civm[5],
        civm[9],
        civm[13],
        civm[2],
        civm[6],
        civm[10],
        civm[14],
        civm[3],
        civm[7],
        civm[11],
        civm[15]
      )
      three.camera.matrixWorldInverse.set(
        cvm[0],
        cvm[4],
        cvm[8],
        cvm[12],
        cvm[1],
        cvm[5],
        cvm[9],
        cvm[13],
        cvm[2],
        cvm[6],
        cvm[10],
        cvm[14],
        cvm[3],
        cvm[7],
        cvm[11],
        cvm[15]
      )
      const canvas = three.renderer.domElement
      three.renderer.setPixelRatio(window.devicePixelRatio)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        three.renderer.setSize(width, height, false)
      }
      three.camera.aspect = width / height
      three.camera.fov = CesiumMath.toDegrees(cesium.viewer.camera.frustum.fovy)
      three.camera.updateProjectionMatrix()
      three.renderer.render(three.scene, three.camera)
    },
    startRenderLoop() {
      cesium.viewer.render()
      this.threeRender()
      requestAnimationFrame(this.startRenderLoop)
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  height: 100%;
  width: 100%;
}

#cesiumContainer {
  position: absolute;
  height: 100%;
  width: 100%;
}

#threeContainer {
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0%;
  z-index: 10;
  pointer-events: none;
}
</style>
