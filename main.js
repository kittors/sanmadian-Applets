import App from './App'
import Vue from 'vue'
//css3动画样式
import './style/animat.css'

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()


