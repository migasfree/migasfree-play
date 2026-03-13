<template>
  <q-dialog
    v-model="showing"
    persistent
    backdrop-filter="blur(12px)"
    aria-labelledby="auth-title"
  >
    <q-card class="glass-card auth-card">
      <q-card-section class="q-pb-none">
        <div
          id="auth-title"
          class="text-h6 text-primary letter-spacing-1 uppercase line-height-1"
        >
          <q-icon :name="appIcon('auth')" size="24px" class="q-mr-sm" />
          {{ $gettext('Authentication') }}
        </div>
        <div class="text-caption text-muted q-mt-xs">
          {{ $gettext('User with privileges on the computer') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <CredentialsForm
          v-model:username="username"
          v-model:password="password"
          @submit="login"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-px-md">
        <q-btn
          v-close-popup
          flat
          color="grey-7"
          class="action-btn"
          :label="$gettext('Cancel')"
          @click="emit('closed')"
        />
        <q-btn
          v-close-popup
          unelevated
          :icon="appIcon('login')"
          color="primary"
          class="action-btn"
          :disabled="!isValid"
          :label="$gettext('Login')"
          @click="login"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import CredentialsForm from 'components/CredentialsForm'

import { useProgramStore } from 'src/stores/program'
import { appIcon } from 'src/composables/element'

const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['closed'])

const programStore = useProgramStore()

const username = ref('')
const password = ref('')
const showing = ref(props.value)

const isValid = computed(() => username.value !== '' && password.value !== '')

const login = () => {
  if (username.value && password.value) {
    programStore.checkUser({
      username: username.value,
      password: password.value,
    })
    username.value = ''
    password.value = ''
    emit('closed')
  }
}

watch(
  () => props.value,
  (newVal) => {
    showing.value = newVal
  },
)
</script>

<style scoped>
.auth-card {
  min-width: 400px;
}
</style>
