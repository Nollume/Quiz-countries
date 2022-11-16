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
    <ul class="grid gap-1 mb-4">
      <li
        class="relative flex items-center gap-2 border border-accent rounded-md bg-primary-900 duration-300 active:opacity-80 hover:opacity-80 overflow-hidden cursor-pointer"
        v-for="(country, index) in optionsCountries"
        :key="country"
        :data-country="country"
        @click.once="userReaction(country, $event)"
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
    <button class="self-center mb-8 bg-accent py-2 px-4 rounded-md">
      Next question >>
    </button>
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
const userAnswered = ref(false);
const url = ref("/api/countries");
let timeout;
let timeout2;

const emit = defineEmits(["closeMenu", "startGame"]);
const props = defineProps({
  options: String,
  region: String,
});

const { data: countries, error, pending, refresh } = useFetch(url);

const getRandomIndexCountry = () => {
  countryIndex.value = null;
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
      progressBar.value.style.backgroundColor = "rgb(239 68 68)";
    }
    timeout = setTimeout(handleProgressBar, 250);
  } else {
    clearTimeout(timeout);
    if (numberOfRound.value < 20) {
      timeout2 = setTimeout(getRandomCountry, 5000);
    }
  }
};

const userReaction = (country, e) => {
  if (!userAnswered.value) {
    userAnswered.value = true;
    clearTimeout(timeout);
    const li = e.target.closest("li");
    let allLi = document.querySelectorAll("li");
    allLi = Array.from(allLi);
    allLi.forEach((list) => (list.style.backgroundColor = "rgb(23 23 23)"));

    if (country === countryIndex.value) {
      correct.value++;
      li.style.backgroundColor = "rgb(22 163 74)";
      // timeout2 = setTimeout(getRandomCountry, 5000);
    } else {
      const correctAnswer = allLi.find((list) => {
        return +list.dataset.country === countryIndex.value;
      });
      li.style.backgroundColor = "rgb(239 68 68)";
      correctAnswer.style.backgroundColor = "green";
      // timeout2 = setTimeout(getRandomCountry, 5000);
    }
  }
};

const startNewGame = () => {
  clearTimeout(timeout);
  clearTimeout(timeout2);
  gameIsGoing.value = true;
  emit("closeMenu", false);
  reset();
  getRandomCountry();
};

const getRandomCountry = () => {
  time.value = 1;
  userAnswered.value = false;
  numberOfRound.value++;
  clearTimeout(timeout2);
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
  correct.value = 0;
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
