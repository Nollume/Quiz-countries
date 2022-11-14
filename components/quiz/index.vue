<template>
  <div class="flex flex-col">
    <div>
      <p @click="getRandomCountry">click</p>
    </div>

    <div class="w-4/5 mx-auto mb-auto mt-8">
      <img class="w-full" :src="countries[countryIndex].flags.svg" alt="flag" />
    </div>
    <ul class="grid grid-cols-2 gap-4 w-4/5 mx-auto mb-auto">
      <li
        class="flex items-center aspect-square gap-2 border border-indigo-800 rounded-md bg-indigo-500 text-indigo-50"
        v-for="(country, index) in optionsCountries"
        :key="country"
      >
        <div class="bg-indigo-700 h-full py-2 px-2">
          <p v-if="index === 0">A</p>
          <p v-else-if="index === 1">B</p>
          <p v-else-if="index === 2">C</p>
          <p v-else>D</p>
        </div>
        <p>{{ countries[country].name?.common }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
const countryIndex = ref(0);
const notRepetiveCountries = ref([]);
const optionsCountries = ref([]);

const { data: countries, error, pending } = useFetch("/api/countries");

const getRandomIndexCountry = () => {
  return (countryIndex.value = Math.floor(
    Math.random() * countries.value.length
  ));
};

const getRandomCountry = () => {
  if (notRepetiveCountries.value.length === countries.value.length) return;

  getRandomIndexCountry();

  if (notRepetiveCountries.value.includes(countryIndex.value)) {
    getRandomCountry();
    return;
  }

  notRepetiveCountries.value.push(countryIndex.value);

  optionsCountries.value.length = 0;
  getRandomOptions();
};

const getRandomOptions = () => {
  if (optionsCountries.value.length === 4) return;
  optionsCountries.value.push(countryIndex.value);

  const randomNumber1 = getRandomIndexCountry();
  const randomNumber2 = getRandomIndexCountry();
  const randomNumber3 = getRandomIndexCountry();

  if (
    optionsCountries.value.includes(randomNumber1) ||
    optionsCountries.value.includes(randomNumber2) ||
    optionsCountries.value.includes(randomNumber3) ||
    randomNumber1 === randomNumber2 ||
    randomNumber1 === randomNumber3 ||
    randomNumber2 === randomNumber3
  ) {
    optionsCountries.value.length = 0;
    getRandomOptions();
    return;
  }

  optionsCountries.value.unshift(randomNumber1);
  optionsCountries.value.unshift(randomNumber2);
  optionsCountries.value.unshift(randomNumber3);

  shuffleOptions();
};

const shuffleOptions = () => {
  return optionsCountries.value.sort(() => Math.random() - 0.5);
};
</script>

<style lang="scss" scoped></style>
