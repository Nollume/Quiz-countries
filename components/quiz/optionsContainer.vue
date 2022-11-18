<template>
  <ul class="grid gap-1 mb-4 sm:mb-0">
    <li
      class="relative flex items-center gap-2 border border-accent rounded-md bg-primary-900 duration-300 active:opacity-80 hover:opacity-80 overflow-hidden cursor-pointer"
      v-for="(country, index) in optionsCountries"
      :key="country"
      :data-country="country"
      @click="userReaction(country, $event)"
    >
      <div class="bg-accent h-full py-2 px-2 grid place-items-center">
        <p>
          {{ OptionsLetters(index) }}
        </p>
      </div>
      <p>
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
