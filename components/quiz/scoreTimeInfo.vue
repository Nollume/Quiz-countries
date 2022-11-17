<template>
  <div class="flex items-center justify-between">
    <p>Score: {{ correct }}</p>
    <p class="flex items-center gap-2" v-show="timeOut">
      Time out! <IconTime class="w-6 h-6" />
    </p>
    <p>{{ numberOfRound }} / 20</p>
  </div>
</template>

<script setup>
const props = defineProps({
  correct: Number,
  timeOut: Boolean,
  numberOfRound: Number,
});
</script>

<style lang="scss" scoped></style>
