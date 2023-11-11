<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 200
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const controls = new OrbitControls(camera, renderer.domElement);

      const texture = new THREE.CubeTextureLoader()
        .setPath('./SampleData/skybox/')
        .load([
          'right.jpg', 'left.jpg', 'top.jpg', 'bottom.jpg', 'front.jpg', 'back.jpg',
        ]);
      scene.background = texture

      const geometry = new TeapotGeometry(10)
      const material = new THREE.MeshBasicMaterial({ envMap: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      animate();
      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
        mesh.rotateY(0.01)
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
