import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { Ion } from 'cesium'
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYmYwMDRlZS1iMDZiLTQ3NTktYTgyYi03M2JhMTIwZmJlOTciLCJpZCI6MzU2NDAsImlhdCI6MTY1ODI5NDYzMH0.Bi7SRpVgLbym0c0SXQhpM1a57mQtRV-waLb14PUkei8"

createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
