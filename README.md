# WebGIS Demo

一个基于 Vue 3 的 WebGIS 三维可视化案例库，集中展示 CesiumJS 与 Three.js 的常用开发效果。项目包含空间数据展示、三维场景、动态特效、交互绘制以及 WebGL 实验等示例，可用于学习、验证方案或快速查阅实现方式。

## 在线预览

[访问 WebGIS Demo](https://zhengjie9510.github.io/webgis-demo/#/)

![WebGIS Demo 预览](demo.gif)

## 主要内容

- Cesium：3D Tiles、GeoJSON、Primitive、I3S、天空盒及环境映射
- 空间交互：点、线、圆、多边形绘制，高亮选择与信息窗口
- 动态效果：雷达扫描、迁徙线、动态墙、水面、雨雪雾等
- Three.js：真实地球、PBR 材质、法线贴图、烟花及轨迹动画
- 首页支持案例分类、关键词搜索与响应式布局

## 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Vue | 3.2.13 | 页面与组件开发 |
| CesiumJS | 1.147.0 | 三维地理场景 |
| Three.js | 0.137.0 | WebGL 三维效果 |
| Element Plus | 2.2.17 | 基础界面组件 |
| Turf.js | 6.5.0 | 空间分析与几何计算 |

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run serve
```

代码检查：

```bash
npm run lint
```

生成生产构建：

```bash
npm run build
```

构建结果会输出到 `dist/` 目录。生产环境的公共路径已配置为 `/webgis-demo/`，用于部署到 GitHub Pages。

## 项目结构

```text
src/
├── components/
│   ├── public/       # Cesium 与通用 WebGIS 示例
│   ├── three/        # Three.js 示例
│   └── gallery-index.js
├── router/           # 示例路由
└── views/
    └── HomeView.vue  # 案例首页

public/
└── SampleData/       # 地图、模型、纹理与示例数据
```

## 发布方式

项目源码维护在 `master` 分支，`gh-pages` 分支保存 `dist/` 中的静态构建产物。更新线上版本时，应先在 `master` 完成构建，再将新的构建产物同步并提交到 `gh-pages` 分支。

> 部分案例包含较大的模型、纹理或动态图资源，首次访问时可能需要稍等片刻。
