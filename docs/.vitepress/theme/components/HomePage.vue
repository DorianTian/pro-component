<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value?.startsWith('zh'))

const isVisible = ref(false)
const githubUrl = 'https://github.com/Dorian-Lab/pro-components'

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true
  })
})

/** Bilingual helper — returns zh or en string based on current locale */
function t(zh: string, en: string): string {
  return isZh.value ? zh : en
}

const icons = {
  table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`,
  form: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="15" y2="16"/></svg>`,
  desc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7" y1="8" x2="11" y2="8"/><line x1="13" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="11" y2="12"/><line x1="13" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/><line x1="13" y1="16" x2="17" y2="16"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3 Q17 8 12 12 Q7 16 12 21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h10M4 17h13"/></svg>`,
  scroll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="14" x2="20" y2="14"/><path d="M20 9v6" stroke-dasharray="2 2"/></svg>`,
  i18n: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  dark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a9 9 0 1 0 9 9c0-4.97-4.03-9-9-9z"/><path d="M12 3a7 7 0 0 1 0 18" fill="currentColor" opacity="0.3"/></svg>`,
}

const features = computed(() => [
  {
    icon: icons.table,
    title: 'ProTable',
    subtitle: t('Schema 驱动数据表格', 'Schema-Driven Data Table'),
    desc: t(
      '一份 Column 配置同时驱动搜索表单、表格列和详情视图。内置分页、工具栏、列设置、可编辑行、10 万行级虚拟滚动。',
      'One column schema drives search form, table columns, and detail view. Built-in pagination, toolbar, column settings, editable rows, and virtual scrolling for 100K+ rows.',
    ),
    color: '#7c6ce7',
  },
  {
    icon: icons.form,
    title: 'ProForm',
    subtitle: t('智能表单构建器', 'Smart Form Builder'),
    desc: t(
      '基于 ValueType 自动生成控件，支持字段分组、colSpan 网格、条件显隐、ModalForm、DrawerForm、StepsForm 及动态数组。',
      'ValueType-based controls, field groups with colSpan grid, conditional visibility, ModalForm, DrawerForm, StepsForm, and ProFormList dynamic arrays.',
    ),
    color: '#3b82f6',
  },
  {
    icon: icons.desc,
    title: 'ProDescriptions',
    subtitle: t('详情定义列表', 'Detail View Renderer'),
    desc: t(
      '复用 ProTable 的 columns 定义渲染只读详情面板。一份 Schema 同时驱动表格和详情，零重复代码。',
      'Reuse ProTable column definitions to render read-only detail panels. Shared schema means zero duplication between table and detail views.',
    ),
    color: '#10b981',
  },
])

const highlights = computed(() => [
  {
    label: t('Headless-First 架构', 'Headless-First'),
    desc: t(
      '每个组件拆分为 Composable（逻辑层）+ Component（渲染层），需要完全控制时随时接管。',
      'Every component splits into Composable (logic) + Component (render). Full control when you need it.',
    ),
    icon: icons.globe,
  },
  {
    label: t('CDN 热更新', 'CDN Hot-Swap'),
    desc: t(
      'Import Maps + ESM CDN 分发，无需重新构建即可升级组件版本，支持灰度发布。',
      'Import Maps + ESM CDN. Upgrade component versions without rebuilding. Grayscale rollout included.',
    ),
    icon: icons.bolt,
  },
  {
    label: '15+ ValueType',
    desc: t(
      'text、date、money、select、switch、rate、progress、image、code... 自动适配表格、表单和详情。',
      'text, date, money, select, switch, rate, progress, image, code... Auto-adapts across table, form, and descriptions.',
    ),
    icon: icons.list,
  },
  {
    label: t('虚拟滚动', 'Virtual Scroll'),
    desc: t(
      'ElTableV2 / ElTreeV2 / ElSelectV2 双引擎，轻松处理 10 万行数据，无需分页。',
      'ElTableV2 / ElTreeV2 / ElSelectV2 dual-engine. Handle 100K rows without pagination.',
    ),
    icon: icons.scroll,
  },
  {
    label: t('国际化就绪', 'i18n Ready'),
    desc: t(
      'ProConfigProvider 内置中英双语，数字、日期、金额格式化器自动适配当前语言环境。',
      'ProConfigProvider with built-in en-US / zh-CN. Locale-aware formatters for numbers, dates, and money.',
    ),
    icon: icons.i18n,
  },
  {
    label: t('深色模式', 'Dark Mode'),
    desc: t(
      '完整的语义化 Token 体系，一键切换全局主题，零硬编码颜色值。',
      'Complete semantic token system. One toggle switches the entire UI. Zero hardcoded colors.',
    ),
    icon: icons.dark,
  },
])

const techStack = computed(() => [
  { name: 'Vue 3.5', icon: '⚡', desc: t('组合式 API', 'Composition API') },
  { name: 'Element Plus 2.13', icon: '🧱', desc: t('UI 基础层', 'UI Foundation') },
  { name: 'TypeScript 5.9', icon: '🔷', desc: t('严格模式', 'Strict Mode') },
  { name: 'Turborepo', icon: '🚀', desc: t('Monorepo 构建', 'Monorepo Build') },
  { name: 'Rollup 4', icon: '📦', desc: 'ESM / CJS / UMD' },
  { name: 'Vitest', icon: '🧪', desc: t('单元 + 组件测试', 'Unit + Component') },
])

const codeExample = `import { ProTable, useProTable } from '@pro/table'

const columns = [
  { dataIndex: 'name', title: 'Name', valueType: 'text' },
  { dataIndex: 'status', title: 'Status', valueType: 'select',
    valueEnum: {
      active: { text: 'Active', status: 'success' },
      disabled: { text: 'Disabled', status: 'error' },
    }},
  { dataIndex: 'createdAt', title: 'Created', valueType: 'date' },
]

// One schema → table + search form + descriptions
<ProTable :columns="columns" :request="fetchData" />`
</script>

<template>
  <div class="pro-home" :class="{ 'is-visible': isVisible }">
    <!-- ====== HERO ====== -->
    <section class="hero">
      <div class="hero__grid-bg" />
      <div class="hero__glow" />
      <div class="hero__content">
        <div class="hero__badge">
          <span class="hero__badge-dot" />
          <span>{{ t('开源免费', 'Open Source') }} &middot; MIT</span>
        </div>
        <h1 class="hero__title">
          <span class="hero__title-line">{{ t('更快构建', 'Build Enterprise') }}</span>
          <span class="hero__title-line hero__title-line--accent">{{
            t('企业级中后台', 'Interfaces Faster')
          }}</span>
        </h1>
        <p class="hero__subtitle">
          Vue 3 + Element Plus {{ t('高阶组件库', 'Higher-Order Component Library') }}<br />
          {{
            t(
              '一份 Schema 同时驱动表格、表单和详情视图',
              'One schema drives tables, forms, and detail views',
            )
          }}
        </p>
        <div class="hero__actions">
          <a href="/guide/getting-started" class="hero__btn hero__btn--primary">
            {{ t('快速上手', 'Get Started') }}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <a :href="githubUrl" target="_blank" rel="noopener" class="hero__btn hero__btn--github">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
              />
            </svg>
            GitHub
          </a>
        </div>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">40+</span>
            <span class="hero__stat-label">{{ t('组件', 'Components') }}</span>
          </div>
          <div class="hero__stat-sep" />
          <div class="hero__stat">
            <span class="hero__stat-value">15+</span>
            <span class="hero__stat-label">ValueTypes</span>
          </div>
          <div class="hero__stat-sep" />
          <div class="hero__stat">
            <span class="hero__stat-value">100%</span>
            <span class="hero__stat-label">TypeScript</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== FEATURES ====== -->
    <section class="features">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">{{ t('核心组件', 'Core Components') }}</span>
          <h2 class="section-title">{{ t('一份 Schema，三种视图', 'One Schema, Three Views') }}</h2>
          <p class="section-desc">
            {{
              t(
                '定义一次 columns 配置，ProTable、ProForm、ProDescriptions 共享同一份 Schema，零重复、最大一致性。',
                'Define your columns once. ProTable, ProForm, and ProDescriptions share the same schema — zero duplication, maximum consistency.',
              )
            }}
          </p>
        </div>
        <div class="features__grid">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="feature-card"
            :style="{ '--delay': `${i * 100}ms`, '--accent': f.color }"
          >
            <div class="feature-card__icon" v-html="f.icon" />
            <div class="feature-card__body">
              <h3 class="feature-card__title">{{ f.title }}</h3>
              <span class="feature-card__subtitle">{{ f.subtitle }}</span>
              <p class="feature-card__desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== HIGHLIGHTS ====== -->
    <section class="highlights">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">{{
            t('为什么选择 Pro Components', 'Why Pro Components')
          }}</span>
          <h2 class="section-title">
            {{ t('开箱即用的企业级能力', 'Enterprise-Grade by Default') }}
          </h2>
        </div>
        <div class="highlights__grid">
          <div v-for="h in highlights" :key="h.label" class="highlight-card">
            <div class="highlight-card__icon" v-html="h.icon" />
            <h4 class="highlight-card__label">{{ h.label }}</h4>
            <p class="highlight-card__desc">{{ h.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== CODE PREVIEW ====== -->
    <section class="code-section">
      <div class="section-container">
        <div class="code-section__layout">
          <div class="code-section__text">
            <span class="section-label">{{ t('快速开始', 'Quick Start') }}</span>
            <h2 class="section-title">{{ t('分钟级接入，不是天', 'Minutes, Not Days') }}</h2>
            <p class="section-desc">
              {{
                t(
                  '定义 columns 配置 valueType，传入 request 函数，ProTable 自动处理搜索表单、分页、格式化和渲染。',
                  'Define columns with valueType, pass a request function. ProTable handles search form, pagination, formatting, and rendering automatically.',
                )
              }}
            </p>
            <a href="/guide/getting-started" class="code-section__link">
              {{ t('阅读指南', 'Read the Guide') }}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
          <div class="code-section__block">
            <div class="code-section__bar">
              <span class="code-section__dot" />
              <span class="code-section__dot" />
              <span class="code-section__dot" />
              <span class="code-section__filename">App.vue</span>
            </div>
            <pre class="code-section__pre"><code>{{ codeExample }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== TECH STACK ====== -->
    <section class="tech-stack">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">{{ t('技术栈', 'Built With') }}</span>
          <h2 class="section-title">{{ t('现代工程，零妥协', 'Modern Stack, No Compromise') }}</h2>
        </div>
        <div class="tech-stack__grid">
          <div v-for="t in techStack" :key="t.name" class="tech-card">
            <span class="tech-card__icon">{{ t.icon }}</span>
            <span class="tech-card__name">{{ t.name }}</span>
            <span class="tech-card__desc">{{ t.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== CTA ====== -->
    <section class="cta">
      <div class="section-container">
        <div class="cta__inner">
          <h2 class="cta__title">{{ t('开始构建', 'Ready to Build?') }}</h2>
          <p class="cta__desc">
            {{
              t(
                '使用 pnpm 安装，几分钟内开始搭建企业级中后台界面。',
                'Install with pnpm and start building enterprise interfaces in minutes.',
              )
            }}
          </p>
          <div class="cta__install">
            <code>pnpm add @pro/pro-components element-plus</code>
          </div>
          <div class="cta__actions">
            <a href="/guide/getting-started" class="hero__btn hero__btn--primary">
              {{ t('快速上手', 'Get Started') }}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a :href="githubUrl" target="_blank" rel="noopener" class="hero__btn hero__btn--github">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ================================================================
   PRO COMPONENTS HOMEPAGE
   Aesthetic: Linear.app meets Vercel — refined, precise, dark-friendly
   ================================================================ */

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.pro-home {
  --home-font: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --home-mono: 'JetBrains Mono', monospace;
  --home-accent: #7c6ce7;
  --home-accent-light: rgba(124, 108, 231, 0.12);
  --home-bg: #ffffff;
  --home-bg-soft: #f8f8fa;
  --home-bg-card: #ffffff;
  --home-border: #e8e8ec;
  --home-text-1: #1a1a2e;
  --home-text-2: #64648b;
  --home-text-3: #9898b0;
  --home-code-bg: #1e1e2e;
  font-family: var(--home-font);
  color: var(--home-text-1);
  overflow-x: hidden;
}

.dark .pro-home {
  --home-bg: #0a0a0f;
  --home-bg-soft: #12121a;
  --home-bg-card: #16161f;
  --home-border: #25253a;
  --home-text-1: #e8e8f0;
  --home-text-2: #8888a8;
  --home-text-3: #5a5a78;
  --home-code-bg: #0d0d14;
}

/* ---- Entrance animation ---- */
.pro-home {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.pro-home.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---- Shared layout ---- */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.section-header {
  text-align: center;
  margin-bottom: 56px;
}
.section-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--home-accent);
  background: var(--home-accent-light);
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 16px;
}
.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}
.section-desc {
  font-size: 16px;
  line-height: 1.7;
  color: var(--home-text-2);
  max-width: 600px;
  margin: 0 auto;
}

/* ================================================================
   HERO
   ================================================================ */
.hero {
  position: relative;
  padding: 120px 24px 80px;
  text-align: center;
  overflow: hidden;
}
.hero__grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--home-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--home-border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.4;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
}
.hero__glow {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 500px;
  background: radial-gradient(ellipse, rgba(124, 108, 231, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.dark .hero__glow {
  background: radial-gradient(ellipse, rgba(124, 108, 231, 0.08) 0%, transparent 70%);
}
.hero__content {
  position: relative;
  z-index: 1;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--home-text-2);
  background: var(--home-bg-card);
  border: 1px solid var(--home-border);
  padding: 6px 16px;
  border-radius: 100px;
  margin-bottom: 32px;
}
.hero__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.hero__title {
  font-size: clamp(40px, 7vw, 72px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 20px;
}
.hero__title-line {
  display: block;
}
.hero__title-line--accent {
  background: linear-gradient(135deg, #7c6ce7 0%, #3b82f6 50%, #10b981 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__subtitle {
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.6;
  color: var(--home-text-2);
  margin: 0 auto 36px;
  max-width: 540px;
}

.hero__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}
.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}
.hero__btn svg {
  width: 16px;
  height: 16px;
}
.hero__btn--primary {
  background: var(--home-accent);
  color: #fff;
  box-shadow: 0 2px 12px rgba(124, 108, 231, 0.35);
}
.hero__btn--primary:hover {
  background: #6b5bd6;
  box-shadow: 0 4px 20px rgba(124, 108, 231, 0.45);
  transform: translateY(-1px);
}
.hero__btn--github {
  background: var(--home-bg-card);
  color: var(--home-text-1);
  border: 1px solid var(--home-border);
}
.hero__btn--github:hover {
  border-color: var(--home-accent);
  color: var(--home-accent);
  transform: translateY(-1px);
}

.hero__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}
.hero__stat {
  text-align: center;
}
.hero__stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.hero__stat-label {
  font-size: 13px;
  color: var(--home-text-3);
  font-weight: 500;
}
.hero__stat-sep {
  width: 1px;
  height: 32px;
  background: var(--home-border);
}

/* ================================================================
   FEATURE CARDS
   ================================================================ */
.features {
  padding: 100px 0;
  background: var(--home-bg-soft);
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--home-bg-card);
  border: 1px solid var(--home-border);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  animation: fadeUp 0.6s ease both;
  animation-delay: var(--delay);
}
.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}
.dark .feature-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.feature-card__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--home-accent-light);
  color: var(--accent);
  border-radius: 12px;
  margin-bottom: 20px;
}
.feature-card__icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.feature-card__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.feature-card__subtitle {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  margin-bottom: 12px;
}
.feature-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--home-text-2);
  margin: 0;
}

/* ================================================================
   HIGHLIGHTS
   ================================================================ */
.highlights {
  padding: 100px 0;
}
.highlights__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.highlight-card {
  padding: 28px;
  border: 1px solid var(--home-border);
  border-radius: 14px;
  transition: all 0.25s ease;
}
.highlight-card:hover {
  background: var(--home-bg-soft);
  border-color: transparent;
}
.highlight-card__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--home-accent);
  margin-bottom: 14px;
}
.highlight-card__icon :deep(svg) {
  width: 20px;
  height: 20px;
}
.highlight-card__label {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
}
.highlight-card__desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--home-text-2);
  margin: 0;
}

/* ================================================================
   CODE SECTION
   ================================================================ */
.code-section {
  padding: 100px 0;
  background: var(--home-bg-soft);
}
.code-section__layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 48px;
  align-items: center;
}
.code-section__text .section-title {
  text-align: left;
}
.code-section__text .section-desc {
  text-align: left;
  margin: 0 0 24px;
}
.code-section__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--home-accent);
  text-decoration: none;
}
.code-section__link:hover {
  gap: 10px;
}
.code-section__link svg {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}
.code-section__link:hover svg {
  transform: translateX(2px);
}

.code-section__block {
  background: var(--home-code-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}
.dark .code-section__block {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.code-section__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.code-section__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}
.code-section__dot:first-child {
  background: #ff5f57;
}
.code-section__dot:nth-child(2) {
  background: #febc2e;
}
.code-section__dot:nth-child(3) {
  background: #28c840;
}
.code-section__filename {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--home-mono);
  margin-left: 8px;
}

.code-section__pre {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
  font-family: var(--home-mono);
  font-size: 13px;
  line-height: 1.7;
  color: #c9d1d9;
}

/* ================================================================
   TECH STACK
   ================================================================ */
.tech-stack {
  padding: 80px 0;
}
.tech-stack__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.tech-card {
  text-align: center;
  padding: 24px 12px;
  border: 1px solid var(--home-border);
  border-radius: 14px;
  transition: all 0.2s ease;
}
.tech-card:hover {
  background: var(--home-bg-soft);
  transform: translateY(-2px);
}
.tech-card__icon {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}
.tech-card__name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}
.tech-card__desc {
  display: block;
  font-size: 12px;
  color: var(--home-text-3);
}

/* ================================================================
   CTA
   ================================================================ */
.cta {
  padding: 100px 0;
}
.cta__inner {
  text-align: center;
  background: var(--home-bg-soft);
  border: 1px solid var(--home-border);
  border-radius: 24px;
  padding: 64px 32px;
}
.cta__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
}
.cta__desc {
  font-size: 16px;
  color: var(--home-text-2);
  margin: 0 0 28px;
}
.cta__install {
  display: inline-block;
  background: var(--home-code-bg);
  color: #c9d1d9;
  padding: 12px 24px;
  border-radius: 10px;
  font-family: var(--home-mono);
  font-size: 14px;
  margin-bottom: 28px;
}
.cta__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ================================================================
   RESPONSIVE
   ================================================================ */
@media (max-width: 960px) {
  .features__grid {
    grid-template-columns: 1fr;
  }
  .highlights__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .code-section__layout {
    grid-template-columns: 1fr;
  }
  .tech-stack__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .hero {
    padding: 80px 20px 60px;
  }
  .hero__stats {
    gap: 16px;
  }
  .hero__stat-value {
    font-size: 22px;
  }
  .highlights__grid {
    grid-template-columns: 1fr;
  }
  .tech-stack__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cta__inner {
    padding: 40px 20px;
  }
}

/* ---- Animation ---- */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
