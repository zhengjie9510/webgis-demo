<template>
  <div class="container"><canvas ref="canvas"></canvas></div>
</template>
<script>
import * as THREE from 'three'

export default {
  props: {
    offsetX: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    this.init()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationFrame)
    if (this.renderer) this.renderer.dispose()
  },
  methods: {
    init() {
      const loader = new THREE.TextureLoader()
      const canvas = this.$refs.canvas

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 2
      scene.add(camera)

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 1)
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      this.renderer = renderer

      const earthGroup = new THREE.Group()
      earthGroup.position.x = this.offsetX
      earthGroup.rotation.z = -0.12
      scene.add(earthGroup)

      // create earth
      const earthMap = loader.load('./SampleData/earth/earthmap.jpg')
      const cloudMap = loader.load('./SampleData/earth/earthCloud.png')
      const galaxyMap = loader.load('./SampleData/earth/galaxy.png')
      earthMap.encoding = THREE.sRGBEncoding
      cloudMap.encoding = THREE.sRGBEncoding
      galaxyMap.encoding = THREE.sRGBEncoding

      const earthgeometry = new THREE.SphereGeometry(0.6, 64, 64)
      const earthmaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        bumpMap: loader.load('./SampleData/earth/earthbump.jpg'),
        specularMap: loader.load('./SampleData/earth/specularmap.jpg'),
        bumpScale: 0.045,
        specular: new THREE.Color(0x486b82),
        shininess: 12
      })

      const earthmesh = new THREE.Mesh(earthgeometry, earthmaterial)
      earthGroup.add(earthmesh)

      // set ambientlight
      const ambientlight = new THREE.HemisphereLight(0x86bfff, 0x06101c, 0.32)
      scene.add(ambientlight)

      // set point light
      const sunlight = new THREE.DirectionalLight(0xfff4df, 1.35)
      sunlight.position.set(4, 2.2, 3)
      scene.add(sunlight)

      // cloud
      const cloudgeometry = new THREE.SphereGeometry(0.615, 64, 64)
      const cloudmaterial = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      })
      const cloudmesh = new THREE.Mesh(cloudgeometry, cloudmaterial)
      earthGroup.add(cloudmesh)

      // atmosphere rim glow
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
              gl_FragColor = vec4(0.20, 0.62, 1.0, 1.0) * rim;
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false
        })
      )
      earthGroup.add(atmosphere)

      // star
      const stargeometry = new THREE.SphereGeometry(80, 64, 64);
      const starmaterial = new THREE.MeshBasicMaterial({
        map: galaxyMap,
        side: THREE.BackSide
      });
      const starmesh = new THREE.Mesh(stargeometry, starmaterial);
      scene.add(starmesh);

      const animate = () => {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
        earthmesh.rotation.y -= 0.00075
        cloudmesh.rotation.y -= 0.00095
        starmesh.rotation.y += 0.00018
        renderer.render(scene, camera)
        this.animationFrame = requestAnimationFrame(animate)
      }
      animate()

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

canvas {
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0%;
}
</style>
