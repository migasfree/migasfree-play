<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-card unelevated class="glass-card filter-card q-mb-md">
        <q-card-section class="q-pa-md">
          <slot />
        </q-card-section>

        <q-card-actions
          v-if="$slots.actions"
          align="right"
          class="q-px-md q-pb-md"
        >
          <slot name="actions" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
