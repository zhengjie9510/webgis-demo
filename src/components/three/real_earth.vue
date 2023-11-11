<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const loader = new THREE.TextureLoader()
      const canvas = document.querySelector('#c')

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 2
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, });
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setClearColor(0x00000, 1.0)

      // create earth
      const earthgeometry = new THREE.SphereGeometry(0.6, 32, 32)
      const earthmaterial = new THREE.MeshPhongMaterial({
        map: loader.load('./SampleData/earth/earthmap.jpg'),
        bumpMap: loader.load('./SampleData/earth/earthbump.jpg'),
        specularMap: loader.load('./SampleData/earth/specularmap.jpg'),
        bumpScale: 0.3,
      })

      const earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
      scene.add(earthmesh);

      // set ambientlight
      const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientlight);

      // set point light
      const pointerlight = new THREE.PointLight(0xffffff, 0.9);
      // set light position
      pointerlight.position.set(5, 3, 5);
      scene.add(pointerlight);

      // cloud
      const cloudgeometry = new THREE.SphereGeometry(0.63, 32, 32);
      const cloudmaterial = new THREE.MeshPhongMaterial({
        map: loader.load('./SampleData/earth/earthCloud.png'),
        transparent: true
      });
      const cloudmesh = new THREE.Mesh(cloudgeometry, cloudmaterial);
      scene.add(cloudmesh);

      // star
      const stargeometry = new THREE.SphereGeometry(80, 64, 64);
      const starmaterial = new THREE.MeshBasicMaterial({
        map: loader.load('./SampleData/earth/galaxy.png'),
        side: THREE.BackSide
      });
      const starmesh = new THREE.Mesh(stargeometry, starmaterial);
      scene.add(starmesh);

      animate();
      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
        earthmesh.rotation.y -= 0.0015;
        cloudmesh.rotation.y += 0.0015;
        starmesh.rotation.y += 0.0005;
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
