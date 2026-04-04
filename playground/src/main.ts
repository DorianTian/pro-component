import './monaco-setup'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import { proComponentsPlugin } from '@pro/pro-components'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

// Register all Element Plus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(proComponentsPlugin)
app.mount('#app')
