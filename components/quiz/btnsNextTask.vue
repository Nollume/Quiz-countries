<template>
  <div class="flex items-center justify-center">
    <button
      v-if="countryIndex !== null && gameIsGoing"
      @click="getRandomCountry"
      class="mb-8 bg-accent py-2 px-4 rounded-md sm:mb-0"
      :disabled="!nextQuestion"
      :class="{ 'opacity-20': !nextQuestion }"
    >
      Next question >>
    </button>
    <div
      v-if="countryIndex !== null && !gameIsGoing"
      class="flex flex-row justify-between gap-2 items-center mb-8 sm:mb-0"
    >
      <p>The quiz has ended!</p>
      <button @click="summary" class="bg-accent py-2 px-4 rounded-md">
        Summary >>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  countryIndex: Number,
  gameIsGoing: Boolean,
  getRandomCountry: Function,
  summary: Function,
  nextQuestion: Boolean,
});
</script>

<style lang="scss" scoped></style>
