<template>
  <button
    v-if="countryIndex !== null && gameIsGoing"
    @click="getRandomCountry"
    class="self-center mb-8 bg-accent py-2 px-4 rounded-md"
    :disabled="!nextQuestion"
    :class="{ 'opacity-20': !nextQuestion }"
  >
    Next question >>
  </button>
  <div
    v-if="countryIndex !== null && !gameIsGoing"
    class="flex flex-row justify-between items-center mb-8"
  >
    <p>The quiz has ended!</p>
    <button @click="summary" class="bg-accent py-2 px-4 rounded-md">
      Summary >>
    </button>
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
