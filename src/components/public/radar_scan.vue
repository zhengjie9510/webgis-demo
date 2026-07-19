<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
export default {
  mounted() {
    this.init()
  },
  methods: {
    init() {
      var viewer = new Cesium.Viewer('cesiumContainer', { terrainProvider: Cesium.createWorldTerrain() })
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.primitives.add(Cesium.createOsmBuildings());
      // Create the scene.
      var scene = viewer.scene
      // Create the circle geometry.
      var circleGeometry = new Cesium.CircleGeometry({
        center: Cesium.Cartesian3.fromDegrees(-74.02, 40.69),
        radius: 200.0,
        vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
      })
      var instance = new Cesium.GeometryInstance({
        geometry: circleGeometry,
      })
      scene.primitives.add(
        new Cesium.GroundPrimitive({
          geometryInstances: instance,
          appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
              translucent: false,
              fabric: {
                uniforms: {
                  color: new Cesium.Color(0.0, 1.0, 0.0),
                  rotate: 90.0,
                  percent: 0.1,
                },
                source: `
                  uniform vec4 color;
                  uniform float percent;
                  
                  float get_angle(vec2 base,vec2 dir)
                  { 
                    base = normalize(base);
                    dir = normalize(dir);
                    float angle = degrees(acos(abs(dot(dir,base))));
                    if (dir.s > 0.0 && dir.t > 0.0){angle = angle;}
                    else if (dir.s < 0.0 && dir.t > 0.0){angle = 180.0 - angle;}
                    else if (dir.s < 0.0 && dir.t < 0.0){angle = 180.0 + angle;}
                    else{angle = 360.0 - angle;}
                    return angle;
                  }

                  czm_material czm_getMaterial(czm_materialInput materialInput)
                  {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    material.diffuse = czm_gammaCorrect(color.rgb); 

                    vec2 st = materialInput.st;
                    vec2 base = vec2(0.5,0.0);
                    vec2 dir = st-vec2(0.5,0.5);
                    float len = length(dir);
                    if(len > 0.49){
                      material.alpha = 1.0;
                      material.diffuse = vec3(1.0,1.0,0.0);
                      material.emission=vec3(0.2);
                    }
                    else{
                      float angle = get_angle(base,dir);
                      material.alpha = (mod(angle + (-czm_frameNumber),360.0)-(1.0-percent)*360.0)/(360.0*percent);
                      material.emission=vec3(0.5);
                    } 
                    return material;
                  }
                  `,
              },
            }),
          }),
        })
      )
      viewer.camera.flyToBoundingSphere(
        Cesium.CircleGeometry.createGeometry(circleGeometry).boundingSphere
      )
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
