<template>
  <div class="home" id="top">
    <header class="nav wrap">
      <a class="brand" href="#top"><i></i> WEBGIS<span>LAB</span></a>
    </header>

    <main>
      <section class="hero">
        <div class="intro">
          <p class="eyebrow"><b></b> WEBGIS EXAMPLES</p>
          <h1>WebGIS<br><em>基础实例</em></h1>
          <p class="lead">Cesium 与 Three.js 三维可视化案例集合。</p>
        </div>
        <div class="visual" aria-label="实时 3D 地球">
          <real-earth class="earth-demo" :offset-x="0.55" />
        </div>
      </section>

      <section class="gallery wrap" id="gallery">
        <div class="heading">
          <div><p class="eyebrow"><b></b> ALL EXAMPLES</p><h2>案例列表</h2></div>
        </div>
        <div class="toolbar">
          <div class="filters">
            <button v-for="item in categories" :key="item.value" :class="{active: activeCategory === item.value}" @click="activeCategory = item.value">
              {{ item.label }} <sup>{{ categoryCount(item.value) }}</sup>
            </button>
          </div>
          <label class="search"><span>⌕</span><input v-model.trim="searchQuery" type="search" placeholder="搜索案例..."></label>
        </div>

        <div v-if="filteredDemos.length" class="grid">
          <article v-for="(demo, index) in filteredDemos" :key="demo.name" tabindex="0" @click="jumpTo(demo.name)" @keydown.enter="jumpTo(demo.name)">
            <div class="preview">
              <img v-if="demo.img" :src="demo.img" :alt="demo.meta.title" loading="lazy">
              <div v-else class="placeholder"><i></i><small>LIVE DEMO</small></div>
              <span class="number">{{ String(index + 1).padStart(2, '0') }}</span><span class="open">↗</span>
            </div>
            <div class="info"><small>{{ categoryLabel(demo) }}</small><h3>{{ demo.meta.title }}</h3><p>{{ description(demo) }}</p></div>
          </article>
        </div>
        <div v-else class="empty"><span>⌕</span><h3>没有找到匹配的案例</h3><button @click="resetFilters">清除筛选条件</button></div>
      </section>
    </main>

    <footer class="wrap"><span class="brand"><i></i> WEBGIS<span>LAB</span></span><a href="#top">BACK TO TOP ↑</a></footer>
  </div>
</template>

<script>
import { gallery_demos } from '../components/gallery-index'
import RealEarth from '../components/three/real_earth.vue'

const threeNames = new Set(['reflector_example', 'high_speed_light_trails', 'custom_surface', 'rain_cloud', 'fireworks_effect', 'normal_mapping', 'physical_material', 'realistic_material', 'real_earth', 'cesium_threejs', 'optimizing_lots_of_objects'])
const effectWords = ['effect', 'trail', 'glow', 'radar', 'migration', 'electric', 'snow', 'rain', 'fog', 'dynamic_wall']

export default {
  components: { RealEarth },
  data() {
    return {
      gallery_demos,
      activeCategory: 'all',
      searchQuery: '',
      categories: [
        { label: '全部', value: 'all' }, { label: 'Cesium', value: 'cesium' },
        { label: 'Three.js', value: 'three' }, { label: '动态特效', value: 'effect' }
      ]
    }
  },
  computed: {
    filteredDemos() {
      const keyword = this.searchQuery.toLowerCase()
      return this.gallery_demos.filter(item => {
        const inCategory = this.activeCategory === 'all' || this.category(item) === this.activeCategory
        return inCategory && (!keyword || item.meta.title.toLowerCase().includes(keyword) || item.name.includes(keyword))
      })
    }
  },
  methods: {
    jumpTo(name) { window.open(this.$router.resolve({ path: name }).href, '_blank', 'noopener') },
    category(item) {
      if (threeNames.has(item.name)) return 'three'
      return effectWords.some(word => item.name.includes(word)) ? 'effect' : 'cesium'
    },
    categoryLabel(item) { return { cesium: 'CESIUM', three: 'THREE.JS', effect: 'VISUAL EFFECT' }[this.category(item)] },
    categoryCount(value) { return value === 'all' ? this.gallery_demos.length : this.gallery_demos.filter(item => this.category(item) === value).length },
    description(item) { return { cesium: '基于 Cesium 的空间数据与场景实践。', three: '探索 WebGL 实时渲染与三维视觉表达。', effect: '为空间场景注入动态视觉与氛围效果。' }[this.category(item)] },
    resetFilters() { this.activeCategory = 'all'; this.searchQuery = '' }
  }
}
</script>

<style lang="scss" scoped>
$cyan: #5af3d0; $ink: #f1f5ff; $muted: #8290a8;
* { box-sizing: border-box; }
.home { min-height:100%; overflow:hidden; color:$ink; font-family:"Avenir Next","HarmonyOS Sans SC","MiSans","PingFang SC",sans-serif; background:radial-gradient(circle at 73% 6%,rgba(50,95,185,.19),transparent 27%),linear-gradient(180deg,#050911,#08101d 55%,#050911); }
.home::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.2; background-image:linear-gradient(rgba(100,130,180,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(100,130,180,.1) 1px,transparent 1px); background-size:72px 72px; mask-image:linear-gradient(#000,transparent 75%); }
.wrap { width:min(1180px,calc(100% - 48px)); margin:auto; position:relative; z-index:1; }
.nav { height:82px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(150,170,210,.13); }
.brand { display:flex; align-items:center; gap:9px; color:$ink; text-decoration:none; font-size:14px; font-weight:800; letter-spacing:1px; }.brand span{color:$cyan}.brand i{width:23px;height:23px;border:1px solid $cyan;border-radius:50%;box-shadow:0 0 15px rgba(90,243,208,.3);position:relative}.brand i::after{content:"";position:absolute;inset:6px;border:2px solid $cyan;border-radius:50%}
.hero{min-height:700px;position:relative;display:flex;align-items:center;overflow:hidden;background:#000}.hero::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,#07101d 0%,#07101d 24%,rgba(7,16,29,.88) 38%,rgba(7,16,29,.2) 61%,transparent 76%),linear-gradient(180deg,#07101d 0%,transparent 18%,transparent 72%,#07101d 100%)}.intro{width:min(1180px,calc(100% - 48px));margin:0 auto;position:relative;z-index:2}.eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 20px;color:$cyan;font-size:9px;font-weight:700;letter-spacing:2.4px}.eyebrow b{width:22px;height:1px;background:$cyan;box-shadow:0 0 8px $cyan}.intro h1{margin:0;font-size:clamp(48px,5.3vw,72px);font-weight:700;line-height:1.12;letter-spacing:-3px}.intro h1 em{color:transparent;font-style:normal;font-weight:600;-webkit-text-stroke:1px $cyan;filter:drop-shadow(0 0 10px rgba(90,243,208,.2))}.lead{margin:25px 0 0;color:$muted;font-size:14px;line-height:1.9;letter-spacing:.2px}
.visual{position:absolute;inset:0;overflow:hidden}.earth-demo{position:absolute;inset:0}
.gallery{padding:82px 0 110px}.heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:42px}.heading .eyebrow{margin-bottom:13px}.heading h2{margin:0;font-size:48px;font-weight:700;letter-spacing:-1.5px}.toolbar{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:28px;border-bottom:1px solid rgba(140,160,195,.15)}.filters{display:flex;flex-wrap:wrap;gap:0 30px;min-width:0;overflow:visible}.filters button{position:relative;padding:0 0 16px;border:0;background:none;color:#748198;cursor:pointer;font-family:inherit;font-size:12px;white-space:nowrap}.filters sup{margin-left:3px;color:#526078;font-size:8px}.filters .active{color:$ink}.filters .active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:$cyan;box-shadow:0 0 9px $cyan}.search{width:190px;display:flex;align-items:center;flex:0 0 auto;padding-bottom:12px;color:#66748b}.search span{margin-right:8px;font-size:18px}.search input{width:100%;border:0;outline:0;background:transparent;color:$ink;font-family:inherit;font-size:11px}.search input::placeholder{color:#59667c}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.grid article{min-width:0;border:1px solid rgba(125,150,190,.16);background:rgba(13,20,38,.75);cursor:pointer;outline:0;transition:.28s}.grid article:hover,.grid article:focus-visible{transform:translateY(-5px);border-color:rgba(90,243,208,.45);box-shadow:0 18px 45px rgba(0,0,0,.3)}.preview{position:relative;aspect-ratio:1.62;overflow:hidden;background:#09111e}.preview::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 58%,rgba(4,9,17,.5));pointer-events:none}.preview img{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.76);transition:.6s}.grid article:hover img{transform:scale(1.045);filter:saturate(1)}.number,.open{position:absolute;z-index:1}.number{top:12px;left:13px;color:rgba(235,242,255,.75);font-size:7px;letter-spacing:1px}.open{right:13px;bottom:11px;width:27px;height:27px;display:grid;place-items:center;border:1px solid rgba(230,240,255,.3);font-size:10px;transition:.2s}.grid article:hover .open{background:$cyan;border-color:$cyan;color:#07121c}.placeholder{height:100%;display:grid;place-items:center;color:#536079;background:radial-gradient(circle,rgba(50,90,155,.2),transparent 48%)}.placeholder i{position:absolute;width:86px;height:86px;border:1px solid rgba(90,243,208,.15);border-radius:50%}.placeholder small{font-size:7px;letter-spacing:2px}.info{padding:18px 19px 20px}.info small{color:$cyan;font-size:7px;font-weight:700;letter-spacing:1.4px}.info h3{margin:8px 0;color:#edf3ff;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.info p{margin:0;color:#6c7990;font-size:9px;line-height:1.6}.empty{padding:80px;text-align:center;border:1px dashed rgba(130,150,185,.2);color:$muted}.empty>span{color:$cyan;font-size:30px}.empty h3{color:$ink}.empty button{padding:9px 14px;border:1px solid rgba(90,243,208,.4);background:none;color:$cyan;cursor:pointer}
footer{min-height:100px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(140,160,195,.13);color:#5b687d;font-size:9px}footer a{color:#758299;text-decoration:none;font-size:8px;letter-spacing:1px}
@media(max-width:900px){.hero{min-height:760px;align-items:flex-start}.hero::after{background:linear-gradient(180deg,#07101d 0%,rgba(7,16,29,.96) 25%,rgba(7,16,29,.18) 58%,#07101d 100%)}.intro{text-align:center;padding-top:72px}.eyebrow{justify-content:center}.earth-demo{inset:18% 0 0}.grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.wrap{width:calc(100% - 28px)}.nav{height:68px}.hero{min-height:700px}.intro{width:calc(100% - 28px);padding-top:58px}.intro h1{font-size:42px;letter-spacing:-1.5px}.earth-demo{inset:22% 0 0}.gallery{padding:60px 0 70px}.heading{display:block}.heading h2{font-size:38px}.toolbar{align-items:stretch;flex-direction:column;border:0}.filters{gap:0 22px;border-bottom:1px solid rgba(140,160,195,.15)}.filters button{font-size:11px}.search{width:100%;padding:11px;border:1px solid rgba(140,160,195,.15)}.grid{grid-template-columns:1fr}footer{padding:28px 0}}
@media(prefers-reduced-motion:reduce){.grid article,.preview img{transition:none}}
</style>
