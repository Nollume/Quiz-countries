<template>
  <div
    class="mb-auto p-4 aspect-video mt-16 text-2xl grid place-items-center border border-accent rounded-md bg-primary-900"
  >
    <div v-if="countryIndex !== null">
      <img
        v-if="options === 'flags'"
        class="w-full"
        :src="countries[countryIndex].flags.svg"
        alt="flag"
      />
      <p v-else>
        {{ countries[countryIndex].capital[0] }}
      </p>
    </div>
    <div v-else class="w-full capitalize text-base">
      <p>Settings: {{ options }}</p>
      <p class="mb-4">Region: {{ region }}</p>
      <QuizStartGameBtn
        @click="startNewGame"
        title="Start Game"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: String,
  region: String,
  countryIndex: Number,
  countries: Object,
  startNewGame: Function,
});
</script>

<style lang="scss" scoped></style>
