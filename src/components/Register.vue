<template>
  <q-dialog v-model="showing" persistent backdrop-filter="blur(12px)">
    <q-card class="glass-card register-card">
      <q-card-section class="q-pb-none">
        <div
          class="text-h6 text-primary letter-spacing-1 uppercase line-height-1"
        >
          <q-icon name="mdi-server-plus" size="24px" class="q-mr-sm" />
          {{ $gettext('Server Registration') }}
        </div>
      </q-card-section>

      <BannerInfo
        type="warning"
        class="q-mx-md q-mt-md"
        :message="
          $gettext(
            'Review config data. If is not correct, cancel register and modify migasfree-client file config.',
          )
        "
      />

      <q-card-section class="q-pt-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-card flat bordered class="bg-surface-variant q-pa-sm">
              <div class="row items-center q-gutter-x-md">
                <InfoItem
                  icon="mdi-server"
                  :label="`${host} (${serverVersion})`"
                  class="col"
                />
                <InfoItem icon="mdi-sitemap" :label="project" class="col" />
              </div>
            </q-card>
          </div>
        </div>

        <div class="text-caption text-muted q-mt-md q-mb-sm">
          {{ $gettext('User with sufficient privileges on the server') }}
        </div>

        <CredentialsForm
          v-model:username="username"
          v-model:password="password"
          @submit="register"
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
          icon="mdi-server-plus"
          color="positive"
          class="action-btn"
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

import BannerInfo from 'components/BannerInfo'
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

<style scoped>
.register-card {
  min-width: 440px;
}
</style>
