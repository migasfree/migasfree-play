<template>
  <q-page padding>
    <PageLayout
      :title="$gettext('Info')"
      icon="info"
      class="print-hide"
      :show-count="false"
      :loading="isUpdating"
      @sync="sync"
    >
      <template #content>
        <Info />
      </template>
    </PageLayout>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import Info from 'components/Info'
import PageLayout from 'components/PageLayout'

import { useComputerStore } from 'src/stores/computer'
import { usePackagesStore } from 'src/stores/packages'
import { usePageSync } from 'src/composables/usePageSync'

const { $gettext } = useGettext()

const computerStore = useComputerStore()
const packagesStore = usePackagesStore()

useMeta({ title: $gettext('Info') })

const { isUpdating, sync } = usePageSync(async () => {
  await Promise.all([
    computerStore.computerInfo(),
    computerStore.computerNetwork(),
    computerStore.computerId(),
    computerStore.computerData(),
    computerStore.computerAttribute(),
    packagesStore.setInventory(),
  ])
})
</script>
