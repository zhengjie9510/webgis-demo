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
      const scene = new THREE.Scene()

      const canvas = document.querySelector('#c')
      const renderer = new THREE.WebGLRenderer({ canvas })
      renderer.setSize(canvas.innerWidth, canvas.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        1,
        1000
      )
      camera.position.z = 4;

      const vertexShaderSource = `
        out vec2 st;
        void main() {
          st =uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `
      const fragmentShaderSource = `
        #define SPARKS 30
        #define FIREWORKS 8.
        #define BASE_PAUSE FIREWORKS / 30.
        #define PI 3.14
        #define PI2 6.28
        uniform vec2 iResolution;
        uniform float iTime;

        float n21(vec2 n) {
            return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        vec2 randomSpark(float noise) {
            vec2 v0 = vec2((noise - .5) * 13., (fract(noise * 123.) - .5) * 15.);
            return v0;
        }

        vec2 circularSpark(float i, float noiseId, float noiseSpark) {
            noiseId = fract(noiseId * 7897654.45);
            float a = (PI2 / float(SPARKS)) * i;
            float speed = 10.*clamp(noiseId, .7, 1.);
            float x = sin(a + iTime*((noiseId-.5)*3.));
            float y = cos(a + iTime*(fract(noiseId*4567.332) - .5)*2.);
            vec2 v0 = vec2(x, y) * speed;
            return v0;
        }


        vec2 rocket(vec2 start, float t) {
            float y = t;
            float x = sin(y*10.+cos(t*3.))*.1;
            vec2 p = start + vec2(x, y * 8.);
            return p;
        }

        vec3 firework(vec2 uv, float index, float pauseTime) {
            vec3 col = vec3(0.);


            float timeScale = 1.;
            vec2 gravity = vec2(0., -9.8);

            float explodeTime = .9;
            float rocketTime = 1.1;
            float episodeTime = rocketTime + explodeTime + pauseTime;

            float ratio = iResolution.x / iResolution.y;

            float timeScaled = (iTime - pauseTime) / timeScale;

            float id = floor(timeScaled / episodeTime);
            float et = mod(timeScaled, episodeTime);

            float noiseId = n21(vec2(id+1., index+1.));

            float scale = clamp(fract(noiseId*567.53)*30., 10., 30.);
            uv *= scale;

            rocketTime -= (fract(noiseId*1234.543) * .5);

            vec2 pRocket = rocket(vec2(0. + ((noiseId - .5)*scale*ratio), 0. - scale/2.), clamp(et, 0., rocketTime));

            if (et < rocketTime) {
                float rd = length(uv - pRocket);
                col += pow(.05/rd , 1.9) * vec3(0.9, .3, .0);
            }


            if (et > rocketTime && et < (rocketTime + explodeTime)) {
                float burst = sign(fract(noiseId*44432.22) - .6);
                for(int i = 0 ; i < SPARKS ; i++) {
                        vec2 center = pRocket;
                        float fi = float(i);
                        float noiseSpark = fract(n21(vec2(id*10.+index*20., float(i+1))) * 332.44);
                        float t = et - rocketTime;
                        vec2 v0;

                        if (fract(noiseId*3532.33) > .5) {
                            v0 = randomSpark(noiseSpark);
                            t -= noiseSpark * (fract(noiseId*543.) * .2);
                        } else {
                            v0 = circularSpark(fi, noiseId, noiseSpark);

                            if ( (fract(noiseId*973.22) - .5) > 0.) {
                                float re = mod(fi, 4. + 10. * noiseId);
                                t -= floor(re/2.) * burst * .1;
                            } else {
                                t -= mod(fi, 2.) == 0. ? 0. : burst * .5*clamp(noiseId, .3, 1.);
                            }
                        }

                        vec2 s = v0*t + (gravity * t * t) / 2.;

                        vec2 p = center + s;

                        float d = length(uv - p);

                        if (t > 0.) {
                            float fade = clamp((1. - t/explodeTime), 0., 1.);
                            vec3 sparkColor = vec3(noiseId*.9, .5*fract(noiseId *456.33), .5*fract(noiseId *1456.33));
                            vec3 c = (.05 / d) * sparkColor;
                            col += c * fade;
                        }
                    }
            }

            return col;
        }

        void main() {
          vec4 fragCoords = gl_FragCoord;

          vec2 uv = fragCoords.xy / iResolution.xy;
          uv -= .5;
          uv.x *= iResolution.x / iResolution.y;

          vec3 col = vec3(0.);

          for (float i = 0. ; i < FIREWORKS ; i += 1.) {
              col += firework(uv, i + 1., (i * BASE_PAUSE));
          }

          gl_FragColor = vec4(col, 1.);
        }
        `
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          iResolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
          iTime: { value: 0 }
        },
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource
      })
      let plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      
      animate()
      function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement
          camera.aspect = canvas.clientWidth / canvas.clientHeight
          camera.updateProjectionMatrix()
        }
        let time = requestAnimationFrame(animate)
        plane.scale.set(4.61 * canvas.clientWidth / canvas.clientHeight, 4.61, 1)
        plane.material.uniforms.iTime = { value: time / 100 }
        plane.material.uniforms.iResolution = { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) }
        renderer.render(scene, camera)
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
