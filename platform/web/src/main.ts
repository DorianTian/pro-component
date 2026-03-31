import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { enUS as proEnUS, zhCN as proZhCN } from '@pro/locale'
import { enUS as dashEnUS, zhCN as dashZhCN } from './locale'
import App from './App.vue'
import { router } from './router'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': { ...proEnUS, ...dashEnUS },
    'zh-CN': { ...proZhCN, ...dashZhCN },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
