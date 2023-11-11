<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Reflector } from 'three/examples/jsm/objects/Reflector'
const chinaJson = require('../../../public/SampleData/china-mercator.json')
let mirror = undefined
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000000000)
      camera.position.set(0, -10000000, 10000000)
      camera.lookAt(0, 0, 0)
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, logarithmicDepthBuffer: true });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      const controls = new OrbitControls(camera, renderer.domElement);
      const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientlight);
      const directionalLight = new THREE.DirectionalLight(0xffffff)
      directionalLight.position.set(1, -1, 1)
      scene.add(directionalLight)

      chinaJson.features.forEach((elem, index) => {
        const { coordinates } = elem.geometry;
        coordinates.forEach(multiPolygon => {
          const province = new THREE.Object3D();
          const lines = new THREE.Object3D();
          multiPolygon.forEach((polygon) => {
            const shape = new THREE.Shape();
            const points = [];
            for (let i = 0; i < polygon.length; i++) {
              let [x, y] = polygon[i];
              x = x - 11600000
              y = y - 4000000
              if (i === 0) {
                shape.moveTo(x, y);
                points.push(new THREE.Vector3(x, y, 200001));
              }
              shape.lineTo(x, y);
              points.push(new THREE.Vector3(x, y, 200001));
            }

            const extrudeSettings = {
              steps: 2,
              depth: 200000,
              bevelEnabled: true,
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material1 = new THREE.MeshPhongMaterial({ color: '#02A1E2', transparent: true, opacity: 0.9 });
            const material2 = new THREE.MeshPhongMaterial({ color: '#3480C4', transparent: true, opacity: 0.9 });
            const mesh = new THREE.Mesh(geometry, [material1, material2]);
            province.add(mesh)

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
            const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
            lines.add(lineMesh)
          })
          scene.add(province)
          scene.add(lines)
        })
      })

      const geometry = new THREE.PlaneGeometry(400000000, 400000000);
      mirror = new Reflector(geometry, {
        clipBias: 0.001,
        textureWidth: canvas.innerWidth * window.devicePixelRatio,
        textureHeight: canvas.innerHeight * window.devicePixelRatio,
      });
      mirror.position.z = -200000;
      mirror.rotateX(- Math.PI / 50)
      // scene.add(mirror);

      animate();
      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const needResize = canvas.width !== width || canvas.height !== height
        if (needResize) {
          renderer.setSize(width, height, false)
          mirror.getRenderTarget().setSize(
            width * window.devicePixelRatio,
            height * window.devicePixelRatio
          );
        }
        return needResize
      }
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

#c {
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0%;
}
</style>
