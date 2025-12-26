<template>
  <div class="row">
    <div class="col">
      <q-card class="q-mx-sm q-my-lg" flat bordered>
        <q-card-section>
          <slot />
        </q-card-section>

        <q-card-actions v-if="$slots.actions" align="right">
          <slot name="actions" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
