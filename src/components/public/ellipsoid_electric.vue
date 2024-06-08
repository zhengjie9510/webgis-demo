<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'

class EllipsoidElectricMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this.color = options.color;
    this.speed = options.speed;

  }
  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  // eslint-disable-next-line
  getType(time) {
    return Cesium.Material.EllipsoidElectricMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
    return result;
  }

  equals(other) {
    return (this === other ||
      (other instanceof EllipsoidElectricMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed)))
  }
}
Object.defineProperties(EllipsoidElectricMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed')
})
Cesium.EllipsoidElectricMaterialProperty = EllipsoidElectricMaterialProperty
Cesium.Material.EllipsoidElectricMaterialType = 'EllipsoidElectricMaterialType';
Cesium.Material.EllipsoidElectricMaterialSource =
  `
	uniform vec4 color;
	uniform float speed;
	
	#define pi 3.1415926535
	#define PI2RAD 0.01745329252
	#define TWO_PI (2. * PI)
	
	float rands(float p){
    return fract(sin(p) * 10000.0);
	}
	
	float noise(vec2 p){
    float time = fract( czm_frameNumber * speed / 1000.0);
    float t = time / 20000.0;
    if(t > 1.0) t -= floor(t);
    return rands(p.x * 14. + p.y * sin(t) * 0.5);
	}
	
	vec2 sw(vec2 p){
    return vec2(floor(p.x), floor(p.y));
	}
	
	vec2 se(vec2 p){
    return vec2(ceil(p.x), floor(p.y));
	}
	
	vec2 nw(vec2 p){
	return vec2(floor(p.x), ceil(p.y));
	}
	
	vec2 ne(vec2 p){
    return vec2(ceil(p.x), ceil(p.y));
	}
	
	float smoothNoise(vec2 p){
    vec2 inter = smoothstep(0.0, 1.0, fract(p));
    float s = mix(noise(sw(p)), noise(se(p)), inter.x);
    float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
    return mix(s, n, inter.y);
	}
	
	float fbm(vec2 p){
    float z = 2.0;
    float rz = 0.0;
    vec2 bp = p;
    for(float i = 1.0; i < 6.0; i++){
      rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
      z *= 2.0;
      p *= 2.0;
    }
    return rz;
	}
	
	czm_material czm_getMaterial(czm_materialInput materialInput){
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    vec2 st2 = materialInput.st;
    float time = fract( czm_frameNumber * speed / 1000.0);
    if (st.t < 0.5) {
      discard;
    }
    st *= 4.;
    float rz = fbm(st);
    st /= exp(mod( time * 2.0, pi));
    rz *= pow(15., 0.9);
    vec4 temp = vec4(0);
    temp = mix( color / rz, vec4(color.rgb, 0.1), 0.2);
    if (st2.s < 0.05) {
      temp = mix(vec4(color.rgb, 0.1), temp, st2.s / 0.05);
    }
    if (st2.s > 0.95){
      temp = mix(temp, vec4(color.rgb, 0.1), (st2.s - 0.95) / 0.05);
    }
    material.diffuse = temp.rgb;
    material.alpha = temp.a * 2.0;
    return material;
	}
	`
Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidElectricMaterialType, {
  fabric: {
    type: Cesium.Material.EllipsoidElectricMaterialType,
    uniforms: {
      color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
      speed: 10.0
    },
    source: Cesium.Material.EllipsoidElectricMaterialSource
  },
  // eslint-disable-next-line
  translucent: function (material) {
    return true;
  }
})

export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655),
        name: '电弧球体',
        ellipsoid: {
          radii: new Cesium.Cartesian3(100.0, 100.0, 100.0),
          material: new Cesium.EllipsoidElectricMaterialProperty({
            color: new Cesium.Color(1.0, 0.5, 0.0, 1.0),
            speed: 10.0
          })
        }
      })
      viewer.zoomTo(entity)
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
