<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import {
  Viewer,
  FeatureDetection,
  Cartesian3,
  GeometryInstance,
  Primitive,
  PolylineMaterialAppearance,
  PolylineGeometry,
  Material,
  Color,
  OpenStreetMapImageryProvider
} from 'cesium'
export default {
  mounted() {
    this.init()
  },
  methods: {
    /**
     * @desc 二阶贝塞尔
     * @param {number} t 当前百分比
     * @param {Array} p1 起点坐标
     * @param {Array} p2 终点坐标
     * @param {Array} cp 控制点
     */
    twoBezier(t, p1, cp, p2) {
      const [x1, y1, z1] = p1
      const [cx, cy, cz] = cp
      const [x2, y2, z2] = p2
      let x = (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * cx + t * t * x2
      let y = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * cy + t * t * y2
      let z = (1 - t) * (1 - t) * z1 + 2 * t * (1 - t) * cz + t * t * z2
      return [x, y, z]
    },
    /**
     * @desc 贝塞尔曲线
     * @param {Array} p1 起点坐标
     * @param {Array} p2 终点坐标
     */
    ceratBezierLine(p1, p2) {
      const maxHeight = 1000000
      const [x1, y1] = p1
      const [x2, y2] = p2
      const cp = [(x1 + x2) / 2, (y1 + y2) / 2, maxHeight]
      const positions = []
      for (let i = 0; i <= 1; i = i + 0.01) {
        let point = this.twoBezier(i, [p1, 0].flat(), cp, [p2, 0].flat())
        positions.push(point)
      }
      return positions.flat()
    },
    init() {
      var viewer = new Viewer('cesiumContainer', {
        imageryProvider: new OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        })
      })
      if (FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true

      const points = {
        start: { 四川: [104.06, 30.67] },
        end: {
          甘肃: [103.73, 36.03],
          青海: [101.74, 36.56],
          河北: [114.48, 38.03],
          云南: [102.73, 25.04],
          贵州: [106.71, 26.57],
          湖北: [114.31, 30.52],
          河南: [113.65, 34.76],
          山东: [117, 36.65],
          江苏: [118.78, 32.04],
          安徽: [117.27, 31.86],
          浙江: [120.19, 30.26],
          江西: [115.89, 28.68],
          福建: [119.3, 26.08],
          广东: [113.23, 23.16],
          湖南: [113, 28.21],
          海南: [110.35, 20.02],
          辽宁: [123.38, 41.8],
          吉林: [125.35, 43.88],
          黑龙江: [126.63, 45.75],
          山西: [112.53, 37.87],
          陕西: [108.95, 34.27],
          台湾: [121.3, 25.03],
          北京: [116.46, 39.92],
          上海: [121.48, 31.22],
          重庆: [106.54, 29.59],
          天津: [117.2, 39.13],
          内蒙古: [111.65, 40.82],
          广西: [108.33, 22.84],
          西藏: [91.11, 29.97],
          宁夏: [106.27, 38.47],
          新疆: [87.68, 43.77],
          香港: [114.17, 22.28],
          澳门: [113.54, 22.19],
        },
      }

      let geometryInstances = []
      let startPoint = points['start'][Object.keys(points['start'])[0]]
      for (let key in points['end']) {
        let endPoint = points['end'][key]
        let polylineGeometry = new PolylineGeometry({
          positions: Cartesian3.fromDegreesArrayHeights(this.ceratBezierLine(startPoint, endPoint)),
          width: 2,
        })
        let geometryInstance = new GeometryInstance({ geometry: polylineGeometry })
        geometryInstances.push(geometryInstance)
      }

      let line = viewer.scene.primitives.add(
        new Primitive({
          geometryInstances: geometryInstances,
          appearance: new PolylineMaterialAppearance({
            material: new Material({
              fabric: {
                uniforms: {
                  color: new Color(1.0, 0.5, 0.0, 1.0),
                  percentage: 0.5, // 尾迹百分比
                  offset: 0.0,
                },
                source: `
                    uniform vec4 color;
                    uniform float percentage;
                    uniform float offset;
                    czm_material czm_getMaterial(czm_materialInput materialInput)
                    {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        float s = materialInput.s;
                        float offset = mod(offset,1.0);
                        material.diffuse = color.rgb;
                        if((percentage + offset)<=1.0){
                            if(s > percentage + offset || s < offset){
                                material.alpha = 0.0;
                            }
                            else{
                                material.alpha = (s-offset)/percentage;
                            }
                        }
                        else{
                            if(s>offset){
                                material.alpha = (s-offset)/percentage;
                            }
                            else if(s <= percentage + offset - 1.0){
                                material.alpha = (1.0+s-offset)/percentage;
                            }
                            else{
                                material.alpha = 0.0;
                            }
                        }
                        return material;
                    }`,
              },
            }),
          }),
        })
      )
      viewer.camera.flyTo({ destination: Cartesian3.fromDegrees(startPoint[0], startPoint[1], 10000000) })
      viewer.scene.preUpdate.addEventListener(function () {
        var offset = line.appearance.material.uniforms.offset
        offset += 0.005
        if (offset > 1.0) {
          offset = 0.0
        }
        line.appearance.material.uniforms.offset = offset
      })
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
