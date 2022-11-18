<template>
  <div
    class="mb-auto p-4 aspect-video mt-16 text-2xl grid place-items-center border border-accent rounded-md bg-primary-900 sm:mt-0"
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
    <div
      v-else
      class="w-full capitalize text-base sm:grid sm:place-items-center sm:gap-4"
    >
      <div>
        <p>Settings: {{ options }}</p>
        <p class="mb-4">Region: {{ region }}</p>
      </div>
      <QuizStartGameBtn
        @click="startNewGame"
        title="Start Game"
        class="w-full"
      />
    </div>
    <div v-if="pending" class="w-full grid place-items-center">Loading...</div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: String,
  region: String,
  countryIndex: Number,
  countries: Object,
  startNewGame: Function,
  pending: Boolean,
});
</script>

<style lang="scss" scoped></style>
