<template>
  <form class="text-primary-900 relative mt-8 border rounded-md border-accent">
    <IconArrow
      class="w-6 h-6 absolute text-primary-100 right-4 top-1/2 -translate-y-1/2 rotate-90"
    />
    <select
      @change="emit('sendOptions', options)"
      class="options"
      name="options"
      v-model="options"
    >
      <option value="flag">Flags</option>
      <option class="capitalize" value="capital">Capital cities</option>
    </select>
  </form>
</template>

<script setup>
const options = ref("flag");
const emit = defineEmits(["sendOptions"]);
</script>

<style lang="scss" scoped></style>
