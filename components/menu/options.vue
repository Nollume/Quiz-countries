<template>
  <form class="text-primary-900 relative mt-8 border rounded-md border-accent">
    <div
      v-if="gameIsGoing"
      class="absolute inset-0 z-50 bg-primary-800/50 rounded-md"
    ></div>
    <IconArrow
      class="w-6 h-6 absolute text-primary-100 right-4 top-1/2 -translate-y-1/2 rotate-90"
    />
    <select
      @change="emit('sendOptions', options)"
      class="options"
      name="options"
      v-model="options"
    >
      <option value="flags">Flags</option>
      <option class="capitalize" value="capital cities">Capital cities</option>
    </select>
  </form>
</template>

<script setup>
const options = ref("flags");
const props = defineProps({
  gameIsGoing: Boolean,
});
const emit = defineEmits(["sendOptions"]);
</script>

<style lang="scss" scoped></style>
