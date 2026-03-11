<template>
  <div :class="['banner', `banner--${type}`]">
    <q-icon :name="resolvedIcon" class="banner-icon" />
    <div class="banner-message">
      <slot>{{ message }}</slot>
    </div>
    <q-btn
      v-if="closable"
      flat
      round
      dense
      icon="mdi-close"
      size="sm"
      class="q-ml-sm"
      @click="$emit('close')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'BannerInfo' })

const props = defineProps({
  message: { type: String, default: '' },
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'warning', 'critical'].includes(v),
  },
  icon: { type: String, default: '' },
  closable: { type: Boolean, default: false },
})

defineEmits(['close'])

const DEFAULT_ICONS = {
  info: 'mdi-information',
  success: 'mdi-check-circle-outline',
  warning: 'mdi-alert-outline',
  critical: 'mdi-alert-circle-outline',
}

const resolvedIcon = computed(
  () => props.icon || DEFAULT_ICONS[props.type] || 'mdi-information',
)
</script>

<style lang="scss" scoped>
.banner {
  --_bg: var(--banner-bg);
  --_border: var(--banner-border);
  --_color: var(--banner-color);
  --_icon: var(--banner-icon);

  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--radius, 12px);
  box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--_border);
  gap: 16px;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: var(--_bg);
  color: var(--_color);
  margin: 16px;

  &:hover {
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

.banner-icon {
  font-size: 24px;
  flex-shrink: 0;
  color: var(--_icon);
}

.banner-message {
  flex-grow: 1;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

/* --- Variants (light) --- */
.banner--info {
  --banner-bg: rgba(30, 64, 175, 0.08);
  --banner-border: rgba(30, 64, 175, 0.15);
  --banner-color: #1e3a8a;
  --banner-icon: #1d4ed8;
}

.banner--success {
  --banner-bg: rgba(22, 101, 52, 0.08);
  --banner-border: rgba(22, 101, 52, 0.15);
  --banner-color: #14532d;
  --banner-icon: #15803d;
}

.banner--warning {
  --banner-bg: rgba(161, 98, 7, 0.08);
  --banner-border: rgba(161, 98, 7, 0.15);
  --banner-color: #713f12;
  --banner-icon: #a16207;
}

.banner--critical {
  --banner-bg: rgba(220, 38, 38, 0.08);
  --banner-border: rgba(220, 38, 38, 0.15);
  --banner-color: #7f1d1d;
  --banner-icon: #dc2626;
}
</style>

<style lang="scss">
/* --- Dark mode overrides (must be more specific or outside scoped) --- */
.body--dark {
  .banner--info {
    --banner-bg: rgba(56, 189, 248, 0.12) !important;
    --banner-border: rgba(56, 189, 248, 0.2) !important;
    --banner-color: #bae6fd !important;
    --banner-icon: #38bdf8 !important;
  }

  .banner--success {
    --banner-bg: rgba(74, 222, 128, 0.12) !important;
    --banner-border: rgba(74, 222, 128, 0.2) !important;
    --banner-color: #bbf7d0 !important;
    --banner-icon: #4ade80 !important;
  }

  .banner--warning {
    --banner-bg: rgba(251, 191, 36, 0.12) !important;
    --banner-border: rgba(251, 191, 36, 0.2) !important;
    --banner-color: #fef08a !important;
    --banner-icon: #fbbf24 !important;
  }

  .banner--critical {
    --banner-bg: rgba(248, 113, 113, 0.12) !important;
    --banner-border: rgba(248, 113, 113, 0.2) !important;
    --banner-color: #fca5a5 !important;
    --banner-icon: #f87171 !important;
  }
}
</style>
