<script setup lang="ts">
/**
 * ProSpin — Refined spinner component.
 * Standalone (inline) or wrapper (overlay on content) modes.
 */
import { computed, useSlots } from 'vue'
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProSpin' })

interface Props {
  spinning?: boolean
  size?: 'small' | 'default' | 'large'
  tip?: string
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  spinning: true,
  size: 'default',
  delay: 0,
})

const { t } = useProLocale()
const slots = useSlots()
const hasContent = computed(() => !!slots.default)

const sizeMap: Record<string, number> = { small: 18, default: 28, large: 44 }
const spinnerSize = computed(() => sizeMap[props.size] ?? 28)
</script>

<template>
  <!-- Wrapper mode -->
  <div v-if="hasContent" class="pro-spin" :class="{ 'pro-spin--active': spinning }">
    <div class="pro-spin__content" :class="{ 'pro-spin__content--dimmed': spinning }">
      <slot />
    </div>
    <Transition name="pro-spin-fade">
      <div v-if="spinning" class="pro-spin__overlay">
        <div class="pro-spin__indicator">
          <div class="pro-spin__dot" :style="{ width: spinnerSize + 'px', height: spinnerSize + 'px' }">
            <span /><span /><span /><span />
          </div>
          <span v-if="tip" class="pro-spin__tip">{{ tip }}</span>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Standalone mode -->
  <span v-else class="pro-spin__inline" role="status" :aria-label="t('pro.common.loading')">
    <span class="pro-spin__dot" :style="{ width: spinnerSize + 'px', height: spinnerSize + 'px' }">
      <span /><span /><span /><span />
    </span>
    <span v-if="tip" class="pro-spin__tip pro-spin__tip--inline">{{ tip }}</span>
  </span>
</template>

<style>
/* ================================================
   ProSpin — Ant Design inspired 4-dot spinner
   ================================================ */

/* ---- Dot container ---- */
.pro-spin__dot {
  position: relative;
  display: inline-block;
  animation: pro-spin-rotate 1.2s linear infinite;
}

/* ---- Individual dots ---- */
.pro-spin__dot > span {
  position: absolute;
  width: 35%;
  height: 35%;
  background-color: var(--pro-color-primary, #2563eb);
  border-radius: 50%;
  opacity: 0.3;
  animation: pro-spin-bounce 1.2s ease-in-out infinite;
  transform: scale(0.6);
}

.pro-spin__dot > span:nth-child(1) {
  top: 0;
  left: 0;
}

.pro-spin__dot > span:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.3s;
}

.pro-spin__dot > span:nth-child(3) {
  bottom: 0;
  right: 0;
  animation-delay: 0.6s;
}

.pro-spin__dot > span:nth-child(4) {
  bottom: 0;
  left: 0;
  animation-delay: 0.9s;
}

/* ---- Animations ---- */
@keyframes pro-spin-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pro-spin-bounce {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.6);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ---- Wrapper mode ---- */
.pro-spin {
  position: relative;
}

.pro-spin__content--dimmed {
  pointer-events: none;
  user-select: none;
  opacity: 0.35;
  transition: opacity 0.3s ease;
}

.pro-spin__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.pro-spin__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* ---- Inline mode ---- */
.pro-spin__inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  vertical-align: middle;
}

/* ---- Tip text ---- */
.pro-spin__tip {
  font-size: var(--pro-text-sm, 13px);
  color: var(--pro-color-primary, #2563eb);
  font-weight: var(--pro-font-weight-medium, 500);
  letter-spacing: 0.01em;
}

.pro-spin__tip--inline {
  font-size: var(--pro-text-xs, 12px);
}

/* ---- Transition ---- */
.pro-spin-fade-enter-active,
.pro-spin-fade-leave-active {
  transition: opacity 0.25s ease;
}

.pro-spin-fade-enter-from,
.pro-spin-fade-leave-to {
  opacity: 0;
}
</style>
