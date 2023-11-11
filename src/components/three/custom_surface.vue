<template>
  <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
class SurfaceGeometry extends THREE.BufferGeometry {
  constructor(width = 1, height = 1, matrix) {
    super();
    this.type = 'SurfaceGeometry';
    const width_half = width / 2;
    const height_half = height / 2;
    const widthSegments = matrix[0].length - 1
    const heightSegments = matrix.length - 1
    const gridX = Math.floor(widthSegments);
    const gridY = Math.floor(heightSegments);
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = width / gridX;
    const segment_height = height / gridY; //

    const numVertices = gridX1 * gridY1;
    const numIndices = gridX * gridY * 6; // 6 indices per quad

    const positionData = new Float32Array(numVertices * 3);
    const indexData = new Uint16Array(numIndices);

    let vertexIndex = 0;
    let indexIndex = 0;

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segment_height - height_half;

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segment_width - width_half;

        positionData[vertexIndex] = x;
        positionData[vertexIndex + 1] = -y;
        positionData[vertexIndex + 2] = matrix[ix][iy];

        vertexIndex += 3;
      }
    }
    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = ix + 1 + gridX1 * (iy + 1);
        const d = ix + 1 + gridX1 * iy;

        indexData[indexIndex++] = a;
        indexData[indexIndex++] = b;
        indexData[indexIndex++] = d;
        indexData[indexIndex++] = b;
        indexData[indexIndex++] = c;
        indexData[indexIndex++] = d;
      }
    }

    this.setIndex(new THREE.BufferAttribute(indexData, 1));
    this.setAttribute('position', new THREE.BufferAttribute(positionData, 3));
    this.computeVertexNormals()
  }
}
class SurfaceMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    super();
    this.type = 'SurfaceMaterial';
    this.vertexShader = `
        out float value;
        void main() {
            value = position.z;
            vec3 transformed = position.xyz;
            vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
            gl_Position = projectionMatrix * mvPosition;
        }`;
    this.fragmentShader = `
        uniform float min_value;
        uniform float max_value;
        in float value;
        vec4 interpolateColor(float t) {
          t = smoothstep(min_value,max_value,t);
          vec3 green = vec3(0.0, 1.0, 0.0);
          vec3 red = vec3(1.0, 0.0, 0.0);
          vec3 color = mix(green, red, t);
          return vec4(color, smoothstep(0.0,0.1,t));
        }
        void main() {

            gl_FragColor = interpolateColor(value);
        }

        `;
    if (parameters !== undefined) {
      if (parameters.attributes !== undefined) {
        console.error('THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead.');
      }

      this.setValues(parameters);
    }
  }
}
class App {
  constructor(canvas) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.innerWidth, this.canvas.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 10000)
    this.camera.position.z = 5

    this.init()
  }
  init() {

    const matrix = this.generateMatrix(100, 10)
    const geometry = new SurfaceGeometry(5, 5, matrix);
    const material = new SurfaceMaterial({
      wireframe: true,
      uniforms: {
        min_value: { value: 0.0 },
        max_value: { value: 1.0 },
      },
      transparent: true
    })

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(-45)
    this.mesh = mesh
    this.scene.add(mesh);
  }
  generateMatrix(size, sigma) {
    var matrix = [];
    var centerX = Math.floor(size / 2);
    var centerY = Math.floor(size / 2);

    // 循环生成矩阵
    for (var i = 0; i < size; i++) {
      matrix[i] = [];
      for (var j = 0; j < size; j++) {
        // 计算距离矩阵中心的距离
        var distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2));

        // 计算高斯分布的值
        var value = Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(sigma, 2)));

        // 将值保存到矩阵中
        matrix[i][j] = value;
      }
    }

    return matrix;
  }
  resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize
  }
  render() {
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    this.mesh.rotateZ(0.005)
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const canvas = document.querySelector('#c')
      const app = new App(canvas)
      app.render()
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
