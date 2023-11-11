<template>
    <div class="container"><canvas id="c"></canvas></div>
</template>
<script>
import * as THREE from 'three'
const mountainUniforms = {
    // x, y, z
    uFreq: new THREE.Uniform(new THREE.Vector3(3, 6, 10)),
    uAmp: new THREE.Uniform(new THREE.Vector3(30, 30, 20))
};
const nsin = val => Math.sin(val) * 0.5 + 0.5;
const mountainDistortion = {
    uniforms: mountainUniforms,
    getDistortion: `
                uniform vec3 uAmp;
                uniform vec3 uFreq;

                #define PI 3.14159265358979
                float nsin(float val){
                    return sin(val) * 0.5+0.5;
                }
                
                vec3 getDistortion(float progress){
                    float movementProgressFix = 0.02;
                    return vec3( 
                        cos(progress * PI * uFreq.x + uTime) * uAmp.x - cos(movementProgressFix * PI * uFreq.x + uTime) * uAmp.x,
                        nsin(progress * PI * uFreq.y + uTime) * uAmp.y - nsin(movementProgressFix * PI * uFreq.y + uTime) * uAmp.y,
                        nsin(progress * PI * uFreq.z + uTime) * uAmp.z - nsin(movementProgressFix * PI * uFreq.z + uTime) * uAmp.z
                    );
                }
            `,
    getJS: (progress, time) => {
        let movementProgressFix = 0.02;

        let uFreq = mountainUniforms.uFreq.value;
        let uAmp = mountainUniforms.uAmp.value;

        let distortion = new THREE.Vector3(
            Math.cos(progress * Math.PI * uFreq.x + time) * uAmp.x -
            Math.cos(movementProgressFix * Math.PI * uFreq.x + time) * uAmp.x,
            nsin(progress * Math.PI * uFreq.y + time) * uAmp.y -
            nsin(movementProgressFix * Math.PI * uFreq.y + time) * uAmp.y,
            nsin(progress * Math.PI * uFreq.z + time) * uAmp.z -
            nsin(movementProgressFix * Math.PI * uFreq.z + time) * uAmp.z
        );

        let lookAtAmp = new THREE.Vector3(2, 2, 2);
        let lookAtOffset = new THREE.Vector3(0, 0, -5);
        return distortion.multiply(lookAtAmp).add(lookAtOffset);
    }
};
class App {
    constructor(canvas, options) {
        this.options = options
        this.canvas = canvas
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.canvas.innerWidth, this.canvas.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 10000)
        this.camera.position.z = -5;
        this.camera.position.y = 7;
        this.camera.position.x = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseout", this.onMouseUp);

        this.init()
    }
    init() {
        const options = this.options;
        this.speedUpTarget = 0;
        this.speedUp = 0;
        this.timeOffset = 0;
        this.fovTarget = 90;

        this.road = new Road(this.scene, options);
        this.leftLights = new CarLights(this.scene, options, options.color.leftCars, 60);
        this.leftLights.mesh.position.setX(
            -options.roadWidth / 2 - options.islandWidth / 2
        );
        this.rightLights = new CarLights(this.scene, options, options.color.rightCars, -60);
        this.rightLights.mesh.position.setX(
            options.roadWidth / 2 + options.islandWidth / 2
        );
        this.leftSticks = new LightsSticks(this.scene, options);
        this.leftSticks.mesh.position.setX(
            -(options.roadWidth + options.islandWidth / 2)
        );
    }

    update(delta) {
        let coefficient = -60 * Math.log2(1 - 0.1);
        let lerpT = Math.exp(-coefficient * delta);
        this.speedUp += lerp(
            this.speedUp,
            this.speedUpTarget,
            // 10% each frame
            lerpT,
            0.00001
        );
        // Also frame-dependent
        this.timeOffset += this.speedUp * delta;

        let time = this.clock.elapsedTime + this.timeOffset;
        this.road.update(time)
        this.leftLights.update(time);
        this.rightLights.update(time);
        this.leftSticks.update(time);

        let fovChange = lerp(this.camera.fov, this.fovTarget, lerpT);
        if (fovChange !== 0) {
            this.camera.fov += fovChange * delta * 6;
            this.camera.updateProjectionMatrix();
        }
        if (this.options.distortion.getJS) {
            const distortion = this.options.distortion.getJS(0.025, time);

            this.camera.lookAt(
                new THREE.Vector3(
                    this.camera.position.x + distortion.x,
                    this.camera.position.y + distortion.y,
                    this.camera.position.z + distortion.z
                ))
        }
    }
    onMouseDown(ev) {
        this.speedUpTarget = 4;
        this.fovTarget = 140;
    }
    onMouseUp(ev) {
        this.speedUpTarget = 0;
        this.fovTarget = 90;
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
        const delta = this.clock.getDelta();
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}
class Road {
    constructor(scene, options) {
        this.scene = scene;
        this.options = options;
        this.init()
    }
    init() {
        const options = this.options;
        const geometry = new THREE.PlaneBufferGeometry(options.width, options.length, 20, 200
        );
        const material = new THREE.ShaderMaterial({
            uniforms: Object.assign(
                {
                    uColor: new THREE.Uniform(new THREE.Color(0x101012)),
                    uTime: new THREE.Uniform(0),
                    uTravelLength: new THREE.Uniform(options.length)
                },
                options.distortion.uniforms
            ),
            vertexShader: `
                uniform float uTravelLength;
                uniform float uTime;
                #include <getDistortion_vertex>
                void main(){
                    vec3 transformed = position.xyz;
                        
                    float progress = (transformed.y + uTravelLength / 2.) / uTravelLength;
                    vec3 distortion  = getDistortion(progress);
                    transformed.x += distortion.x;
                    transformed.z += distortion.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.);
                }
                `,
            fragmentShader: `
                uniform vec3 uColor;
                void main(){
                    gl_FragColor = vec4(uColor,1.);
                }
                `,
            side: THREE.DoubleSide
        })
        material.onBeforeCompile = shader => {
            shader.vertexShader = shader.vertexShader.replace(
                "#include <getDistortion_vertex>",
                options.distortion.getDistortion
            );
        };
        const mesh = new THREE.Mesh(geometry, material);

        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -options.length / 2;

        this.scene.add(mesh);
        this.mesh = mesh
    }
    update(time) {
        this.mesh.material.uniforms.uTime.value = time;
    }
}
class CarLights {
    constructor(scene, options, colors, speed) {
        this.scene = scene;
        this.options = options;
        this.colors = colors;
        this.speed = speed;
        this.init()
    }
    init() {
        const options = this.options;

        const curve = new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        )
        const baseGeometry = new THREE.TubeBufferGeometry(curve, 25, 1, 8, false);

        const instanced = new THREE.InstancedBufferGeometry().copy(baseGeometry);
        instanced.instanceCount = options.nPairs * 2;

        let aOffset = [];
        let aMetrics = [];
        let aColor = [];

        let colors = this.colors;
        if (Array.isArray(colors)) {
            colors = colors.map(c => new THREE.Color(c));
        } else {
            colors = new THREE.Color(colors);
        }

        let sectionWidth = options.roadWidth / options.roadSections;
        for (let i = 0; i < options.nPairs; i++) {
            let radius = Math.random() * 0.1 + 0.1;
            let length =
                Math.random() * options.length * 0.08 + options.length * 0.02;
            // 1a. Get it's lane index
            // Instead of random, keep lights per lane consistent
            let section = i % 3;

            // 1b. Get its lane's centered position
            let sectionX = section * sectionWidth - options.roadWidth / 2 + sectionWidth / 2;
            let carWidth = 0.5 * sectionWidth;
            let offsetX = 0.5 * Math.random();

            let offsetY = radius * 1.3;

            let offsetZ = Math.random() * options.length;

            aOffset.push(sectionX - carWidth / 2 + offsetX);
            aOffset.push(offsetY);
            aOffset.push(-offsetZ);

            aOffset.push(sectionX + carWidth / 2 + offsetX);
            aOffset.push(offsetY);
            aOffset.push(-offsetZ);

            aMetrics.push(radius);
            aMetrics.push(length);

            aMetrics.push(radius);
            aMetrics.push(length);

            let color = pickRandom(colors);
            aColor.push(color.r);
            aColor.push(color.g);
            aColor.push(color.b);

            aColor.push(color.r);
            aColor.push(color.g);
            aColor.push(color.b);
        }
        // Add the offset to the instanced geometry.
        instanced.setAttribute(
            "aOffset",
            new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
        );
        instanced.setAttribute(
            "aMetrics",
            new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
        );
        instanced.setAttribute(
            "aColor",
            new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );
        const material = new THREE.ShaderMaterial({
            fragmentShader: `
                in vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor,1.);
                }
                `,
            vertexShader: `
                in vec3 aOffset;
                in vec2 aMetrics;
                in vec3 aColor;
                out vec3 vColor;
                uniform float uTime;
                uniform float uSpeed;
                uniform float uTravelLength;
                #include <getDistortion_vertex>
                void main() {
                    vec3 transformed = position.xyz;

                    float radius = aMetrics.r;
                    float len = aMetrics.g;
                    transformed.xy *= radius; 
                    transformed.z *= len;

                    float zOffset = uTime * uSpeed + aOffset.z;
                    zOffset = len - mod(zOffset, uTravelLength);

                    // transformed.z +=uTime * uSpeed;


                    // Keep them separated to make the next step easier!
                    transformed.z = transformed.z +zOffset ;
                    transformed.xy += aOffset.xy;


                    float progress = abs(transformed.z / uTravelLength);
                    transformed.xyz += getDistortion(progress);

                    vColor = aColor;
                    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
                    gl_Position = projectionMatrix * mvPosition;
                }`,
            uniforms: Object.assign(
                {
                    uColor: new THREE.Uniform(new THREE.Color(this.color)),
                    uTravelLength: new THREE.Uniform(options.length),
                    uTime: new THREE.Uniform(0),
                    uSpeed: new THREE.Uniform(this.speed)
                },
                options.distortion.uniforms
            )
        });
        material.onBeforeCompile = shader => {
            shader.vertexShader = shader.vertexShader.replace(
                "#include <getDistortion_vertex>",
                options.distortion.getDistortion
            );
        };
        let mesh = new THREE.Mesh(instanced, material);
        mesh.frustumCulled = false;
        this.mesh = mesh;
        this.scene.add(mesh);
    }
    update(time) {
        this.mesh.material.uniforms.uTime.value = time;
    }
}
class LightsSticks {
    constructor(scene, options) {
        this.scene = scene;
        this.options = options;
        this.init()
    }
    init() {
        const options = this.options;
        const geometry = new THREE.PlaneBufferGeometry(1, 1);
        let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
        let totalSticks = options.totalSideLightSticks;
        instanced.instanceCount = totalSticks;

        let stickoffset = options.length / (totalSticks - 1);
        const aOffset = [];
        const aColor = [];
        const aMetrics = [];

        let colors = this.options.color.sticks

        if (Array.isArray(colors)) {
            colors = colors.map(c => new THREE.Color(c));
        } else {
            colors = new THREE.Color(colors);
        }

        for (let i = 0; i < totalSticks; i++) {
            let width = random(options.lightStickWidth);
            let height = random(options.lightStickHeight);
            aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

            let color = pickRandom(colors);
            aColor.push(color.r);
            aColor.push(color.g);
            aColor.push(color.b);

            aMetrics.push(width);
            aMetrics.push(height);
        }
        instanced.setAttribute(
            "aOffset",
            new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false)
        );
        instanced.setAttribute(
            "aColor",
            new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );
        instanced.setAttribute(
            "aMetrics",
            new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
        );
        const material = new THREE.ShaderMaterial({
            fragmentShader: `
                varying vec3 vColor;
                void main(){
                    vec3 color = vec3(vColor);
                    gl_FragColor = vec4(color,1.);
                }
                `,
            vertexShader: `
                attribute float aOffset;
                attribute vec3 aColor;

                attribute vec2 aMetrics;

                uniform float uTravelLength;
                uniform float uTime;

                varying vec3 vColor;
                mat4 rotationY( in float angle ) {
                    return mat4(	cos(angle),		0,		sin(angle),	0,
                                            0,		1.0,			 0,	0,
                                    -sin(angle),	0,		cos(angle),	0,
                                            0, 		0,				0,	1);
                }

                #include <getDistortion_vertex>
                void main(){
                    vec3 transformed = position.xyz;
                    float width = aMetrics.x;
                    float height = aMetrics.y;

                    transformed.xy *= vec2(width,height);
                    float time = mod(uTime  * 60. *2. + aOffset , uTravelLength);

                    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

                    transformed.z +=  - uTravelLength + time;


                    float progress = abs(transformed.z / uTravelLength);
                    transformed.xyz += getDistortion(progress);

                    transformed.y += height /2.;
                    transformed.x += -width/2.;
                    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
                    gl_Position = projectionMatrix * mvPosition;
                    vColor = aColor;
                }
                `,
            // This ones actually need double side
            side: THREE.DoubleSide,
            uniforms: Object.assign(
                {
                    uTravelLength: new THREE.Uniform(options.length),
                    uTime: new THREE.Uniform(0)
                },
                options.distortion.uniforms
            )
        });

        material.onBeforeCompile = shader => {
            shader.vertexShader = shader.vertexShader.replace(
                "#include <getDistortion_vertex>",
                options.distortion.getDistortion
            );
        };

        const mesh = new THREE.Mesh(instanced, material);
        // The object is behind the camera before the vertex shader
        mesh.frustumCulled = false;
        // mesh.position.y = options.lightStickHeight / 2;
        this.scene.add(mesh);
        this.mesh = mesh;
    }
    update(time) {
        this.mesh.material.uniforms.uTime.value = time;
    }

}
function random(base) {
    if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
    return Math.random() * base;
}
function pickRandom(arr) {
    if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
    return arr;
}
function lerp(current, target, speed = 0.1, limit = 0.001) {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
        change = target - current;
    }
    return change;
}
export default {
    mounted() {
        this.init()
    },
    methods: {
        init() {
            const canvas = document.querySelector('#c')
            const options = {
                length: 400,
                width: 20,
                roadWidth: 9,
                islandWidth: 2,
                nPairs: 50,
                roadSections: 3,
                distortion: mountainDistortion,

                totalSideLightSticks: 50,
                lightStickWidth: [0.12, 0.5],
                lightStickHeight: [1.3, 1.7],

                color: {
                    /***  Only these colors can be an array ***/
                    leftCars: [0xff102a, 0xEB383E, 0xff102a],
                    rightCars: [0xdadafa, 0xBEBAE3, 0x8F97E4],
                    sticks: 0xdadafa,
                }
            };
            const app = new App(canvas, options)
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
