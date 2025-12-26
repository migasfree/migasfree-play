<template>
  <q-dialog v-model="showing" persistent>
    <q-card flat>
      <q-banner class="bg-warning text-black">
        {{
          $gettext(
            'Review config data. If is not correct, cancel register and modify migasfree-client file config.',
          )
        }}
        <q-card-section>
          <q-card flat bordered class="half q-ma-md">
            <InfoItem icon="mdi-server" :label="`${host} (${serverVersion})`" />
            <InfoItem icon="mdi-sitemap" :label="project" />
          </q-card>
        </q-card-section>
        <template #action>
          <q-btn
            v-close-popup
            flat
            color="black"
            :label="$gettext('Cancel')"
            @click="emit('closed')"
          />
        </template>
      </q-banner>

      <q-card-section class="row items-center">
        <div class="text-h5">
          {{ $gettext('User with sufficient privileges on the server') }}
        </div>
      </q-card-section>

      <q-card-section>
        <CredentialsForm
          v-model:username="username"
          v-model:password="password"
          @submit="register"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          icon="mdi-server-plus"
          color="positive"
          :disabled="!isValid"
          :label="$gettext('Register')"
          @click="register"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import CredentialsForm from 'components/CredentialsForm'
import InfoItem from 'components/InfoItem'

import { useComputerStore } from 'src/stores/computer'
import { useProgramStore } from 'src/stores/program'

const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['closed'])

const computerStore = useComputerStore()
const programStore = useProgramStore()

const username = ref('')
const password = ref('')
const showing = ref(props.value)

const { project } = storeToRefs(computerStore)

const host = programStore.host
const serverVersion = programStore.serverVersion

const isValid = computed(() => {
  const user = username.value?.trim() ?? ''
  const pass = password.value?.trim() ?? ''

  return user.length > 0 && pass.length > 0
})

const register = async () => {
  if (!username.value || !password.value) return

  await computerStore.registerComputer({
    user: username.value,
    password: password.value,
  })
  username.value = ''
  password.value = ''
  emit('closed')
}

watch(
  () => props.value,
  (newVal) => {
    showing.value = newVal
  },
)
</script>
