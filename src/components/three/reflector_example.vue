<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Reflector } from 'three/examples/jsm/objects/Reflector'

let camera, scene, renderer;
let cameraControls;
let smallSphere;
let groundMirror
export default {
  mounted() {
    this.init()
    this.animate()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')
      // renderer
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.useLegacyLights = false;

      // scene
      scene = new THREE.Scene();

      // camera
      camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 1, 500);
      camera.position.set(0, 75, 100);

      cameraControls = new OrbitControls(camera, renderer.domElement);
      cameraControls.update();
      //
      let geometry, material;

      geometry = new THREE.CircleGeometry(40, 40);
      groundMirror = new Reflector(geometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
      });
      groundMirror.position.y = 0.5;
      groundMirror.rotateX(- Math.PI / 2);
      scene.add(groundMirror);

      geometry = new THREE.IcosahedronGeometry(5, 0);
      material = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x7b7b7b, flatShading: true });
      smallSphere = new THREE.Mesh(geometry, material);
      scene.add(smallSphere);

      // lights
      const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
      mainLight.position.y = 60;
      scene.add(mainLight);

      const gridHelper = new THREE.GridHelper(100, 100);
      scene.add(gridHelper);
    },
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        renderer.setSize(width, height, false)
        groundMirror.getRenderTarget().setSize(
          width * window.devicePixelRatio,
          height * window.devicePixelRatio
        );
      }
      return needResize
    },
    animate() {
      requestAnimationFrame(this.animate);
      if (this.resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
      }

      const timer = Date.now() * 0.01;
      smallSphere.position.set(
        Math.cos(timer * 0.1) * 30,
        Math.abs(Math.cos(timer * 0.2)) * 20 + 5,
        Math.sin(timer * 0.1) * 30
      );
      smallSphere.rotation.y = (Math.PI / 2) - timer * 0.1;
      smallSphere.rotation.z = timer * 0.8;

      cameraControls.update();
      renderer.render(scene, camera);
    }
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
