<template>
  <div
    class="flex flex-col gap-2 items-center border border-accent rounded-md bg-primary-900 p-4 mb-auto"
  >
    <h3 class="text-xl">Your Score: {{ correct }} / 20</h3>
    <p v-if="correct <= 5">You should improve, very poor result...</p>
    <p v-else-if="correct <= 10">
      The average result, you still have room for improvement...
    </p>
    <p v-else-if="correct <= 15">Good result, keep it up...</p>
    <p v-else-if="correct <= 20">
      Wow, what an incredible result! You are the best!!!
    </p>
  </div>
</template>

<script setup>
const props = defineProps({ correct: Number });
</script>

<style lang="scss" scoped></style>
