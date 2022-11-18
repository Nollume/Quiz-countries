<template>
  <button
    class="relative px-1 py-2.5 bg-accent rounded-md border border-primary-900 duration-300 hover:opacity-90 sm:w-1/2 sm:mx-auto"
  >
    <slot />

    {{ title }}
  </button>
</template>

<script setup>
const props = defineProps({ title: String });
</script>

<style lang="scss" scoped></style>
