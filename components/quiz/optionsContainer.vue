<template>
  <ul class="grid gap-1 mb-4 sm:mb-0 sm:h-60 sm:gap-2 md:grid-cols-2">
    <li
      class="relative flex items-center gap-2 border border-accent rounded-md bg-primary-900 duration-300 active:opacity-80 hover:opacity-80 overflow-hidden cursor-pointer md:flex-col"
      v-for="(country, index) in optionsCountries"
      :key="country"
      :data-country="country"
      @click="userReaction(country, $event)"
    >
      <div
        class="bg-accent h-full py-2 px-2 grid place-items-center md:h-auto md:w-full"
      >
        <p>
          {{ OptionsLetters(index) }}
        </p>
      </div>
      <p class="md:px-4 md:py-0.5 md:my-auto">
        {{ countries[country].name?.common }}
      </p>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  optionsCountries: Array,
  countries: Object,
  userReaction: Function,
});

const OptionsLetters = (index) => {
  if (index === 0) return "A";
  else if (index === 1) return "B";
  else if (index === 2) return "C";
  else return "D";
};
</script>

<style lang="scss" scoped></style>
