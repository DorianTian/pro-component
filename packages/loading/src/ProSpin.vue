<script setup lang="ts">
/**
 * ProSpin — Lightweight spinner component.
 * Can be used standalone (inline indicator) or as a wrapper (overlay on content).
 */
import { computed, useSlots } from 'vue'
import { useProLocale } from '@pro/hooks'

defineOptions({ name: 'ProSpin' })

interface Props {
  /** Whether to show the spinner */
  spinning?: boolean
  /** Spinner size: small (16px), default (24px), large (40px) */
  size?: 'small' | 'default' | 'large'
  /** Loading tip text shown below the spinner */
  tip?: string
  /** Delay before showing spinner (ms) — prevents flash for fast loads */
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

const sizeMap: Record<string, number> = {
  small: 16,
  default: 24,
  large: 40,
}

const spinnerSize = computed(() => sizeMap[props.size] ?? 24)
const strokeWidth = computed(() => (props.size === 'small' ? 3 : 2.5))
</script>

<template>
  <!-- Wrapper mode: overlay spinner on slotted content -->
  <div v-if="hasContent" class="pro-spin" :class="{ 'pro-spin--spinning': spinning }">
    <div class="pro-spin__content" :class="{ 'pro-spin__content--blur': spinning }">
      <slot />
    </div>
    <Transition name="pro-spin-fade">
      <div v-if="spinning" class="pro-spin__overlay">
        <div class="pro-spin__indicator">
          <svg
            class="pro-spin__svg"
            :width="spinnerSize"
            :height="spinnerSize"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="var(--pro-border-default, #e5e5e5)"
              :stroke-width="strokeWidth"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="var(--pro-color-primary, #2563eb)"
              :stroke-width="strokeWidth"
              stroke-linecap="round"
            />
          </svg>
          <span v-if="tip" class="pro-spin__tip">{{ tip }}</span>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Standalone mode: inline spinner -->
  <span v-else class="pro-spin__inline" role="status" :aria-label="t('pro.common.loading')">
    <svg
      class="pro-spin__svg"
      :width="spinnerSize"
      :height="spinnerSize"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--pro-border-default, #e5e5e5)"
        :stroke-width="strokeWidth"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="var(--pro-color-primary, #2563eb)"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="tip" class="pro-spin__tip pro-spin__tip--inline">{{ tip }}</span>
  </span>
</template>

<style>
/* ---- Animation ---- */
@keyframes pro-spin-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pro-spin__svg {
  animation: pro-spin-rotate 0.8s linear infinite;
}

/* ---- Wrapper mode ---- */
.pro-spin {
  position: relative;
}

.pro-spin__content--blur {
  pointer-events: none;
  user-select: none;
  opacity: 0.4;
  filter: blur(0.5px);
  transition:
    opacity 0.2s ease,
    filter 0.2s ease;
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
  gap: 8px;
}

/* ---- Inline mode ---- */
.pro-spin__inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
}

/* ---- Tip text ---- */
.pro-spin__tip {
  font-size: var(--pro-text-sm, 13px);
  color: var(--pro-color-primary, #2563eb);
  font-weight: var(--pro-font-weight-medium, 500);
}

.pro-spin__tip--inline {
  font-size: var(--pro-text-xs, 12px);
}

/* ---- Transition ---- */
.pro-spin-fade-enter-active,
.pro-spin-fade-leave-active {
  transition: opacity 0.2s ease;
}

.pro-spin-fade-enter-from,
.pro-spin-fade-leave-to {
  opacity: 0;
}
</style>
