import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { proComponentsPlugin } from '@pro/pro-components'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(proComponentsPlugin)
app.mount('#app')
