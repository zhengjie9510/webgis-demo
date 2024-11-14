const files = [
    { file: "public", name: 'skybox_change', title: '天空盒'},
    { file: "public", name: 'custom_primitive', title: '自定义Primitive' },
    { file: "public", name: 'move_3dTiles', title: '3DTiles位置调整' },
    { file: "public", name: 'border_mask', title: '边界掩膜' },
    { file: "public", name: 'dynamic_wall', title: '动态墙' },
    { file: "public", name: 'trail_line', title: '道路穿梭线' },
    { file: "public", name: 'dynamic_water', title: '动态水面' },
    { file: "public", name: 'glow_border', title: '发光边界' },
    { file: "public", name: 'ellipsoid_electric', title: '电弧圆' },
    { file: "public", name: 'radar_scan', title: '雷达扫描' },
    { file: "public", name: 'radar_effect', title: '雷达效果' },
    { file: "public", name: 'migration_line', title: '迁徙线效果' },
    { file: "public", name: 'dynamic_polyline_volume', title: '流动管线' },
    { file: "public", name: 'snow_effect', title: '雪天效果' },
    { file: "public", name: 'select_hightlight_instance', title: 'GeometryInstance点击改变颜色' },
    { file: "public", name: 'select_hightlight', title: '点击高亮' },
    { file: "public", name: 'sky_box', title: '天空盒' },
    { file: "public", name: 'environment_mapping', title: '环境映射(反射)' },
    { file: "public", name: 'environment_mapping_refraction', title: '环境映射(折射)' },
    { file: "public", name: 'flight_tracker', title: '移动的模型' },
    { file: "public", name: 'info_window', title: '信息窗口' },
    { file: "public", name: 'rotate_arround', title: '绕点旋转' },
    { file: "public", name: 'draw_point', title: '画点' },
    { file: "public", name: 'draw_line', title: '画线' },
    { file: "public", name: 'draw_circle', title: '画圆' },
    { file: "public", name: 'draw_polygon', title: '画多边形' },
    { file: "public", name: 'fog_effect', title: '雾天效果' },
    { file: "public", name: 'rain_effect', title: '雨天效果' },
    { file: "public", name: 'i3s_object', title: '加载I3S数据' },
    { file: "public", name: 'massive_points', title: '海量点加载' },
    { file: "public", name: 'vertical_trail_line', title: '竖直尾迹线' },
    { file: "public", name: 'grounded_billboard', title: '广告牌贴地' },
    { file: "public", name: 'custom_geometry', title: '自定义几何体' },
    { file: "public", name: 'tianditu_map', title: '天地图' },
    { file: "public", name: 'layers_split', title: '卷帘分屏' },
    { file: "public", name: 'cesium_threejs', title: 'Cesium集成Threejs' },
    { file: "public", name: 'map_3d', title: '3d地图' },
    { file: "public", name: 'optimizing_lots_of_objects', title: 'Threejs加载大量几何体' },
    { file: "three", name: 'reflector_example', title: '倒影' },
    { file: "three", name: 'high_speed_light_trails', title: '移动轨迹' },
    { file: "three", name: 'custom_surface', title: '矩阵转曲面' },
    { file: "three", name: 'rain_cloud', title: '降雨效果' },
    { file: "three", name: 'fireworks_effect', title: '烟花效果' },
    { file: "three", name: 'normal_mapping', title: '法线贴图' },
    { file: "three", name: 'physical_material', title: '基于物理的渲染' },
    { file: "three", name: 'realistic_material', title: '基于物理的纹理' },
    { file: "three", name: 'real_earth', title: '3D地球' }
]

function createRouter(files) {
    const result = []
    for (let item of files) {
        let file = item['file']
        let name = item['name']
        let title = item['title']
        result.push({
            name: name,
            path: '/' + name,
            img: require('./' + file + '/' + name + '.gif'),
            component: () => import('./' + file + '/' + name + '.vue'),
            meta: {
                title: title,
            },
        })
    }
    console.log("共有", result.length, "个DEMO")
    return result
}

export const gallery_demos = createRouter(files)
