<template>
  <button
    class="relative px-1 py-2.5 bg-accent rounded-md border border-primary-900 duration-300 hover:opacity-90"
  >
    <IconNewGame
      class="w-6 h-6 absolute text-primary-100 right-4 top-1/2 -translate-y-1/2 rotate-90"
    />
    {{ title }}
  </button>
</template>

<script setup>
const props = defineProps({ title: String });
</script>

<style lang="scss" scoped></style>
