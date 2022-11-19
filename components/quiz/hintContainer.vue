<template>
  <div
    class="mb-auto relative h-60 p-4 mt-16 text-2xl grid place-items-center border border-accent rounded-md bg-primary-900 sm:mt-0 sm:row-start-3"
    :class="{ 'sm:col-span-2': countryIndex === null }"
  >
    <div v-if="countryIndex !== null">
      <img
        v-if="options === 'flags'"
        class="sm:w-auto max-h-48"
        :src="countries[countryIndex].flags.png"
        alt="flag"
      />

      <p v-else>
        {{ countries[countryIndex].capital[0] }}
      </p>
    </div>
    <div v-else class="w-full capitalize flex flex-col items-center gap-8">
      <h2 class="text-3xl">Countries Quiz</h2>
      <button
        @click="emit('openMenu', true)"
        class="p-4 border-4 border-accent rounded-full duration-300 hover:shadow-2xl hover:shadow-accent"
      >
        <IconStart />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: String,
  countryIndex: Number,
  countries: Object,
});
const emit = defineEmits(["openMenu"]);
</script>

<style lang="scss" scoped></style>
