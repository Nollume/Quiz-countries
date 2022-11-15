<template>
  <div
    class="w-full min-h-screen px-6 flex flex-col gap-2 justify-between relative"
  >
    <div
      v-if="options === 'flag'"
      class="mb-auto p-4 aspect-video mt-16 text-2xl grid place-items-center border border-accent rounded-md bg-primary-900"
    >
      <img
        v-if="countryIndex !== null"
        class="w-full"
        :src="countries[countryIndex].flags.svg"
        alt="flag"
      />
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
    <div
      v-else
      class="mb-auto p-4 aspect-video mt-16 text-2xl grid place-items-center border border-accent rounded-md bg-primary-900"
    >
      <p v-if="countryIndex !== null">
        {{ countries[countryIndex].capital[0] }}
      </p>
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
    <div v-if="gameIsGoing" class="flex items-center justify-between">
      <p>correct: {{ correct }}</p>
      <p>{{ numberOfRound }} / 20</p>
    </div>
    <div
      class="relative w-full h-3 bg-primary-900 border border-accent"
      :class="{ hidden: !gameIsGoing }"
    >
      <div
        class="absolute w-full inset-0 bg-accent origin-left"
        ref="progressBar"
      ></div>
    </div>
    <ul class="grid gap-1 mb-8">
      <li
        class="flex items-center gap-2 border border-accent rounded-md bg-primary-900"
        v-for="(country, index) in optionsCountries"
        :key="country"
      >
        <div class="bg-accent h-full py-2 px-2 grid place-items-center">
          <p>{{ OptionsLetters(index) }}</p>
        </div>
        <p>{{ countries[country].name?.common }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
const countryIndex = ref(null);
const notRepetiveCountries = ref([]);
const optionsCountries = ref([]);
const numberOfRound = ref(0);
const progressBar = ref(null);
const gameIsGoing = ref(false);
let time = ref(1);
const correct = ref(0);
const url = ref("/api/countries");
let timeout;

const emit = defineEmits(["closeMenu", "startGame"]);
const props = defineProps({
  options: String,
  region: String,
});

const { data: countries, error, pending, refresh } = useFetch(url);

const getRandomIndexCountry = () => {
  return (countryIndex.value = Math.floor(
    Math.random() * countries.value.length
  ));
};

const shuffleOptions = () => {
  return optionsCountries.value.sort(() => Math.random() - 0.5);
};
const handleProgressBar = () => {
  if (time.value.toFixed(2) >= 0) {
    progressBar.value.style.transform = `scaleX(${time.value})`;
    progressBar.value.style.backgroundColor = "rgb(55 48 163)";
    time.value -= 0.025;

    if (time.value <= 0.2) {
      progressBar.value.style.backgroundColor = "red";
    }
    timeout = setTimeout(handleProgressBar, 250);
  } else {
    clearTimeout(timeout);
    if (numberOfRound.value < 20) {
      setTimeout(getRandomCountry, 5000);
    }
  }
};

const startNewGame = () => {
  gameIsGoing.value = true;
  emit("closeMenu", false);
  reset();
  getRandomCountry();
};

const getRandomCountry = () => {
  time.value = 1;
  numberOfRound.value++;
  if (notRepetiveCountries.value.length === countries.value.length) return;
  handleProgressBar();
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

const OptionsLetters = (index) => {
  if (index === 0) return "A";
  else if (index === 1) return "B";
  else if (index === 2) return "C";
  else return "D";
};

const reset = () => {
  countryIndex.value = null;
  notRepetiveCountries.value.length = 0;
  optionsCountries.value.length = 0;
  numberOfRound.value = 0;
};

onMounted(() => {
  emit("startGame", startNewGame);
});

watchEffect(() => {
  if (props.region === "all") {
    url.value = "/api/countries";
  } else if (props.region === "europe") {
    url.value = "/api/europe";
  } else if (props.region === "oceania") {
    url.value = "/api/oceania";
  } else if (props.region === "asia") {
    url.value = "/api/asia";
  } else if (props.region === "africa") {
    url.value = "/api/africa";
  } else {
    url.value = "/api/americas";
  }
  reset();
  refresh();
});
</script>
