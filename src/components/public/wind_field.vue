<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
const data = require('../../../public/SampleData/field.json')

class Field {
  constructor(obj) {
    this.init(obj)
  }

  init(obj) {
    this.header = obj[0].header
    this.left = this.header.left
    this.top = this.header.top
    this.right = this.header.right
    this.bottom = this.header.bottom
    this.rows = this.header.ny
    this.cols = this.header.nx
    this.dx = this.header.dx
    this.dy = this.header.dy

    const u_component = obj[0].data
    const v_component = obj[1].data
    const z_component = obj[2].data

    this.grid = []
    for (let i = 0; i < this.rows; i++) {
      const row = []
      for (let j = 0; j < this.cols; j++) {
        const index = i * this.cols + j
        const u = u_component[index]
        const v = v_component[index]
        const z = z_component[index]
        row.push([u, v, z])
      }
      this.grid.push(row)
    }
  }

  /**
   * Calculates the u, v, and z components of the wind field at a given point (x, y) using bilinear interpolation.
   * 
   * @param {number} x - The x-coordinate of the target point.
   * @param {number} y - The y-coordinate of the target point.
   * @returns {Array} - An array containing the u, v, and z components of the wind field at the target point.
   */
  getUVZ(x, y) {
    const x0 = Math.floor((x - this.left) / this.dx);
    const y0 = Math.floor((this.top - y) / this.dy);  // 调整y轴的计算
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const grid00 = this.grid[y0][x0];
    const grid01 = this.grid[y0][x1];
    const grid10 = this.grid[y1][x0];
    const grid11 = this.grid[y1][x1];

    const u00 = grid00[0];
    const v00 = grid00[1];
    const z00 = grid00[2];

    const u01 = grid01[0];
    const v01 = grid01[1];
    const z01 = grid01[2];

    const u10 = grid10[0];
    const v10 = grid10[1];
    const z10 = grid10[2];

    const u11 = grid11[0];
    const v11 = grid11[1];
    const z11 = grid11[2];

    const dx = (x - this.left) / this.dx - x0;
    const dy = (this.top - y) / this.dy - y0;

    const a = (1 - dx) * (1 - dy);
    const b = dx * (1 - dy);
    const c = (1 - dx) * dy;
    const d = dx * dy;

    const u = a * u00 + b * u01 + c * u10 + d * u11;
    const v = a * v00 + b * v01 + c * v10 + d * v11;
    const z = a * z00 + b * z01 + c * z10 + d * z11;
    return { u, v, z };
  }

  isInBound(x, y) {
    return x >= this.left && x <= this.right - this.dx && y >= this.bottom + this.dx && y <= this.top
  }
}

class LineParticle {
  /**
   * @param {Cesium.PolylineCollection} particleCollection
   * @param {Field} field
   */
  constructor(particleCollection, field) {
    this.x = undefined
    this.y = undefined
    this.z = undefined
    this.u = undefined
    this.v = undefined
    this.tx = undefined
    this.ty = undefined
    this.tz = undefined
    this.age = undefined
    this.maxAge = 100
    this.maxNum = 20
    this.speed = 1
    this.field = field
    this.particles = []
    this.particleCollection = particleCollection
    this.color = new Cesium.Color(1.0, 0.0, 0.0, 1.0)
    this.width = 2
  }

  init() {
    this.age = Math.random() * this.maxAge
    let start = this.randomPosition()
    let uvz = this.field.getUVZ(start.x, start.y)
    this.x = start.x, this.y = start.y, this.z = uvz.z
    this.u = uvz.u, this.v = uvz.v
  }

  randomPosition() {
    const x = this.field.left + Math.random() * (this.field.right - this.field.left - this.field.dx)
    const y = this.field.bottom + this.field.dy + Math.random() * (this.field.top - this.field.bottom - this.field.dy)
    return { x, y }
  }

  getNextPosition(x, y, u, v) {
    const dx = u * this.speed
    const dy = v * this.speed
    const tx = x + dx
    const ty = y - dy
    return { tx, ty }
  }

  updateParticle() {
    if (this.age <= 0) {
      for (let i = 0; i < this.particles.length; i++) {
        this.particleCollection.remove(this.particles[i])
      }
      this.particles = []
      this.init()
    }

    if (this.particles.length > this.maxNum) {
      this.particleCollection.remove(this.particles[0])
      this.particles.shift()
    }

    this.particles.forEach((particle) => {
      particle.material.uniforms.color.alpha -= (1 / this.maxNum)
    })

    let next = this.getNextPosition(this.x, this.y, this.u, this.v)
    if (this.field.isInBound(next.tx, next.ty)) {
      this.tx = next.tx, this.ty = next.ty
      let uvz = this.field.getUVZ(this.tx, this.ty)
      this.tz = uvz.z
      this.u = uvz.u, this.v = uvz.v
      const particle = this.particleCollection.add({
        positions: [new Cesium.Cartesian3(this.x, this.y, this.z), new Cesium.Cartesian3(this.tx, this.ty, this.tz)],
        width: this.width,
        material: new Cesium.Material({
          fabric: {
            type: 'Color',
            uniforms: {
              color: this.color.clone(),
            }
          }
        })
      })
      this.particles.push(particle)
      this.x = this.tx, this.y = this.ty, this.z = this.tz

      this.age = this.age - 1
    }
    else {
      this.age = 0
    }
  }
}

class ParticleSystem {
  constructor(obj) {
    this.maxNum = 500
    this.lineParticles = []
    this.field = new Field(obj)
    this.particleCollection = new Cesium.PolylineCollection()
  }

  init() {
    for (let i = 0; i < this.maxNum; i++) {
      const lineParticle = new LineParticle(this.particleCollection, this.field)
      lineParticle.init()
      this.lineParticles.push(lineParticle)
    }
  }

  update() {
    this.lineParticles.forEach((lineParticle) => {
      lineParticle.updateParticle()
    })
  }
}

const particleSystem = new ParticleSystem(data)

export default {
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      var viewer = new Cesium.Viewer('cesiumContainer', { terrainProvider: await Cesium.createWorldTerrainAsync() })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.debugShowFramesPerSecond = true
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.4, 39.895, 1000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-60),
          roll: Cesium.Math.toRadians(0),
        }
      })

      const modelCenter = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 50)
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter)

      particleSystem.init()
      particleSystem.particleCollection.modelMatrix = modelMatrix
      viewer.scene.primitives.add(particleSystem.particleCollection)

      setInterval(() => {
        particleSystem.update()
      }, 50)
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
