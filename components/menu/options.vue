<template>
  <form class="text-primary-900 relative mt-8 border rounded-md border-accent">
    <div
      v-if="gameIsGoing"
      class="absolute inset-0 z-50 bg-primary-800/50 rounded-md"
    ></div>

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
