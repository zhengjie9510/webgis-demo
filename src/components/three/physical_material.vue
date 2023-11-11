<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')
      const loader = new THREE.TextureLoader()

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 5
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const controls = new OrbitControls(camera, renderer.domElement);

      // set ambientlight
      const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientlight);
      // set point light
      const pointerlight = new THREE.PointLight(0xffffff, 0.9);
      // set light position
      pointerlight.position.set(200, 0, 100);
      scene.add(pointerlight);

      const geometry = new THREE.SphereGeometry(1, 64, 64);
      loader.setPath('./SampleData/marble/')
      const material = new THREE.MeshPhysicalMaterial({
        map: loader.load('Marble017_1K_Color.png'),
        normalMap: loader.load('Marble017_1K_NormalGL.png'),
        roughnessMap: loader.load('Marble017_1K_Roughness.png'),
        displacementMap: loader.load('Marble017_1K_Displacement.png'),
        displacementScale: 0.10,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      animate();
      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }

        // mesh.rotateY(0.01)
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
