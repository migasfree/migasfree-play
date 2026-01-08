<template>
  <q-item v-if="show">
    <q-item-section avatar>
      <q-icon :name="icon" color="blue-grey-7" />
    </q-item-section>

    <q-item-section class="text-body1">
      <slot>{{ label }}</slot>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, default: '' },
  show: { type: Boolean, default: true },
})
</script>
