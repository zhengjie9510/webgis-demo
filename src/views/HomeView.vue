<template>
    <div class="container">
        <el-header>
            <span>WebGIS基础实例</span>
            <div><el-avatar :size="35" src="favicon.ico"></el-avatar></div>
        </el-header>
        <el-main>
            <el-row>
                <el-col v-for="demo in gallery_demos" :key="demo" :xs="24" :sm="12" :md="8">
                    <el-card
                        @click="jumpTo(demo.name)"
                        :body-style="{
                            padding: '5px',
                        }"
                    >
                        <el-image :src="demo.img" lazy class="image"> </el-image>
                        <div class="title">
                            <span>{{ demo.meta.title }}</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </el-main>
    </div>
</template>

<script>
import { gallery_demos } from '../components/gallery-index'

export default {
  data() {
    return {
      gallery_demos: gallery_demos
    }
  },
  methods: {
    jumpTo(target) {
      const route = this.$router.resolve({
        path: target
      })
      window.open(route.href)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
    height: 100%;
}
.el-header {
    position: fixed;
    width: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    font-family: cursive;
    font-weight: bold;
    font-size: larger;
}
.el-main {
    position: relative;
    background-color: rgb(0, 0, 0);
    .el-card {
        margin: 5px;
        border: 2px solid #6d91da;
        border-radius: 5px;
        background-color: rgb(25, 2, 56);
        color: rgb(255, 255, 255);
    }
    .el-card:hover {
        background-color: #01aefee0;
        color: rgba(238, 255, 0, 0.986);
    }
    .title {
        text-align: center;
        background-color: inherit;
        color: inherit;
    }
    .image {
        width: 100%;
        border-radius: 5px;
        display: block;
    }
}
</style>
