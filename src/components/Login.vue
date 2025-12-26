<template>
  <q-dialog v-model="showing" persistent>
    <q-card flat>
      <q-card-section class="row items-center">
        <div class="text-h5">
          {{ $gettext('User with privileges on the computer') }}
        </div>
      </q-card-section>

      <q-card-section>
        <CredentialsForm
          v-model:username="username"
          v-model:password="password"
          @submit="login"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          color="primary"
          :label="$gettext('Cancel')"
          @click="emit('closed')"
        />
        <q-btn
          v-close-popup
          icon="mdi-login"
          color="positive"
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
