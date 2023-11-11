<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 10000)
      camera.position.z = 500
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.outputEncoding = THREE.sRGBEncoding;

      const controls = new OrbitControls(camera, renderer.domElement);

      const texture = new THREE.CanvasTexture(new FlakesTexture());
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = 10;
      texture.repeat.y = 6;

      const envmaploader = new THREE.PMREMGenerator(renderer);
      new RGBELoader().setPath('./SampleData/').load('garden_nook_2k.hdr', function (hdrmap) {
        const envmap = envmaploader.fromCubemap(hdrmap);
        const ballMaterial = {
          clearcoat: 1.0,
          cleacoatRoughness: 0.1,
          metalness: 0.9,
          roughness: 0.5,
          color: 0x8418ca,
          normalMap: texture,
          normalScale: new THREE.Vector2(0.15, 0.15),
          envMap: envmap.texture
        };
        hdrmap.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = hdrmap;

        const geometry = new THREE.SphereGeometry(100, 64, 64)
        const material = new THREE.MeshPhysicalMaterial(ballMaterial);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // lights
        const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
        mainLight.position.y = 60;
        scene.add(mainLight);

        const greenLight = new THREE.PointLight(0x00ff00, 0.5, 1000, 0);
        greenLight.position.set(550, 50, 0);
        scene.add(greenLight);

        const redLight = new THREE.PointLight(0xff0000, 0.5, 1000, 0);
        redLight.position.set(- 550, 50, 0);
        scene.add(redLight);

        const blueLight = new THREE.PointLight(0xbbbbfe, 0.5, 1000, 0);
        blueLight.position.set(0, 50, 550);
        scene.add(blueLight);
      })

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
