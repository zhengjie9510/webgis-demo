<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from 'cesium'
import { default as MyPrimitive } from './plugins/MyPrimitive'

export default {
  data() {
    return { path: process.env.BASE_URL }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const viewer = new Cesium.Viewer('cesiumContainer')
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio
      }
      viewer.scene.postProcessStages.fxaa.enabled = true
      viewer.scene.debugShowFramesPerSecond = true;

      const scene = viewer.scene;
      const context = scene.context;
      const framebuffer = new Cesium.Framebuffer({
        context: context,
        colorTextures: [
          new Cesium.Texture({
            context: context,
            width: context.canvas.width * window.devicePixelRatio,
            height: context.canvas.height * window.devicePixelRatio
          })
        ],
        depthStencilRenderbuffer: new Cesium.Renderbuffer({
          context: context,
          width: context.canvas.width * window.devicePixelRatio,
          height: context.canvas.height * window.devicePixelRatio,
          format: Cesium.RenderbufferFormat.DEPTH_STENCIL
        })
      });
      //模型矩阵
      const modelMatrix = Cesium.Matrix4.multiplyByUniformScale(
        Cesium.Matrix4.multiplyByTranslation(
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(116.23, 39.54)
          ),
          new Cesium.Cartesian3(0.0, 0.0, 25),
          new Cesium.Matrix4()
        ),
        200.0,
        new Cesium.Matrix4()
      )

      const myPrimitive = new MyPrimitive(modelMatrix, context, framebuffer)
      viewer.scene.primitives.add(myPrimitive)

      const fragmentShaderSource = `
        in vec2 v_textureCoordinates;
        uniform sampler2D colorTexture;
        uniform sampler2D renderTexture;
        out vec4 fragColor;
        void main(void) {
            vec4 renderColor = texture(renderTexture, v_textureCoordinates);
            vec4 color = texture(colorTexture, v_textureCoordinates);
            if ((renderColor.r < 0.9 || renderColor.g < 0.9 || renderColor.b < 0.9) && renderColor.a > 0.2) {
              fragColor = renderColor;
            }
            else {
              fragColor = color;
            }
        }
        `;

      viewer.scene.postProcessStages.add(
        new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
          uniforms: {
            renderTexture: myPrimitive.framebuffer._colorTextures[0]
          },
        })
      );

      const heading = Cesium.Math.toRadians(-90.0);
      const pitch = Cesium.Math.toRadians(-90.0);
      const range = 500.0;
      viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(116.23, 39.54, 500), new Cesium.HeadingPitchRange(heading, pitch, range))
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

      // 监听窗口的resize事件
      window.addEventListener('resize', () => {
        // 更新framebuffer的宽度和高度
      });
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
