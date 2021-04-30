<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  async created() {
    await this.$store.dispatch('app/init')
  }
}
</script>
