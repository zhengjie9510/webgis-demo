<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
const img = 'SampleData/smoke.png'
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x11111f, 0.002)

      const canvas = document.querySelector('#c')
      const renderer = new THREE.WebGLRenderer({ canvas })
      renderer.setClearColor(scene.fog.color)
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        1,
        1000
      )
      camera.position.z = 1
      camera.rotation.x = 1.16
      camera.rotation.y = -0.12
      camera.rotation.z = 0.27

      const ambient = new THREE.AmbientLight(0x555555)
      scene.add(ambient)

      const directionalLight = new THREE.DirectionalLight(0xffeedd)
      directionalLight.position.set(0, 0, 1)
      scene.add(directionalLight)

      const flash = new THREE.PointLight(0xffffff, 30, 500, 1.7)
      flash.position.set(200, 300, 100)
      scene.add(flash)

      const rainGeo = new THREE.BufferGeometry()
      const pointsArray = new Array()
      const rainCount = 15000
      for (let i = 0; i < rainCount; i++) {
        const rainDrop = new THREE.Vector3(
          Math.random() * 400 - 200,
          Math.random() * 500 - 250,
          Math.random() * 400 - 200
        )
        rainDrop.velocity = 0
        pointsArray.push(rainDrop)
      }
      rainGeo.setFromPoints(pointsArray)
      const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true,
      })
      const rain = new THREE.Points(rainGeo, rainMaterial)
      scene.add(rain)

      const cloudParticles = []
      let loader = new THREE.TextureLoader()
      loader.load(
        img,
        function(texture) {
          const cloudGeo = new THREE.PlaneBufferGeometry(500, 500)
          const cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
          })
          for (let p = 0; p < 25; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial)
            cloud.position.set(
              Math.random() * 800 - 400,
              500,
              Math.random() * 500 - 450
            )
            cloud.rotation.x = 1.16
            cloud.rotation.y = -0.12
            cloud.rotation.z = Math.random() * 360
            cloud.material.opacity = 0.6
            cloudParticles.push(cloud)
            scene.add(cloud)
          }
          animate()
        },
        () => {},
        (err) => {
          console.error(err)
        }
      )
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

      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }

        cloudParticles.forEach((p) => {
          p.rotation.z -= 0.002
        })
        pointsArray.forEach((p) => {
          p.velocity -= 0.1 + Math.random() * 0.1
          p.y += p.velocity
          if (p.y < -200) {
            p.y = 200
            p.velocity = 0
          }
        })
        rainGeo.setFromPoints(pointsArray)
        rain.rotation.y += 0.002
        if (Math.random() > 0.93 || flash.power > 100) {
          if (flash.power < 100)
            flash.position.set(
              Math.random() * 400,
              300 + Math.random() * 200,
              100
            )
          flash.power = 50 + Math.random() * 500
        }
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
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
