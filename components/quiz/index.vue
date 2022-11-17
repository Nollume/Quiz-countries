<template>
  <div
    class="w-full min-h-screen px-6 flex flex-col gap-2 justify-between relative"
  >
    <div
      v-if="options === 'flags'"
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
    <div
      v-if="quizEnd"
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
    <div v-if="countryIndex !== null" class="flex items-center justify-between">
      <p>Score: {{ correct }}</p>
      <p class="flex items-center gap-2" v-show="timeOut">
        Time out! <IconTime class="w-6 h-6" />
      </p>
      <p>{{ numberOfRound }} / 20</p>
    </div>
    <div
      class="relative w-full h-3 bg-primary-900 border border-accent"
      :class="{ hidden: countryIndex === null }"
    >
      <div
        class="absolute w-full inset-0 bg-accent origin-left"
        ref="progressBar"
      ></div>
    </div>
    <ul v-if="countryIndex !== null" class="grid gap-1 mb-4">
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
  </div>
</template>

<script setup>
const countryIndex = ref(null);
const notRepetiveCountries = ref([]);
const optionsCountries = ref([]);
const numberOfRound = ref(0);
const progressBar = ref(null);
const timeOut = ref(false);
const gameIsGoing = ref(false);
let time = ref(1);
const correct = ref(0);
const userAnswered = ref(false);
const url = ref("/api/countries");
const nextQuestion = ref(false);
const quizEnd = ref(false);
let timeOutClear;

const emit = defineEmits(["closeMenu", "startGame", "gameIsGoing"]);
const props = defineProps({
  options: String,
  region: String,
});

const { data: countries, error, refresh } = useFetch(url);

const getRandomIndexCountry = () => {
  return Math.floor(Math.random() * countries.value.length);
};

const shuffleOptions = () => {
  return optionsCountries.value.sort(() => Math.random() - 0.5);
};
const getCorrectLi = () => {
  let allLi = document.querySelectorAll("li");
  allLi = Array.from(allLi);
  const correctAnswer = allLi.find(
    (list) => +list.dataset.country === countryIndex.value
  );
  return correctAnswer;
};
const changeBgColor = () => {
  let allLi = document.querySelectorAll("li");
  allLi = Array.from(allLi);
  allLi.forEach((list) => (list.style.backgroundColor = "rgb(23 23 23)"));
};
const handleProgressBar = () => {
  if (time.value.toFixed(2) >= 0) {
    progressBar.value.style.transform = `scaleX(${time.value})`;
    progressBar.value.style.backgroundColor = "rgb(55 48 163)";
    time.value -= 0.025;

    if (time.value <= 0.2) {
      progressBar.value.style.backgroundColor = "rgb(239 68 68)";
    }
    timeOutClear = setTimeout(handleProgressBar, 250);
  } else {
    clearTimeout(timeOutClear);
    userAnswered.value = true;
    getCorrectLi().style.backgroundColor = "rgb(22 163 74)";
    timeOut.value = true;
    if (numberOfRound.value < 20) {
      nextQuestion.value = true;
    } else if (numberOfRound.value === 20) {
      gameIsGoing.value = false;
      emit("gameIsGoing", gameIsGoing.value);
    }
  }
};

const userReaction = (country, e) => {
  clearTimeout(timeOutClear);
  if (!userAnswered.value) {
    userAnswered.value = true;
    const li = e.target.closest("li");

    if (country === countryIndex.value) {
      correct.value++;
      li.style.backgroundColor = "rgb(22 163 74)";

      if (numberOfRound.value < 20) {
        nextQuestion.value = true;
      } else if (numberOfRound.value === 20) {
        gameIsGoing.value = false;
        emit("gameIsGoing", gameIsGoing.value);
      }
    } else {
      li.style.backgroundColor = "rgb(239 68 68)";
      getCorrectLi().style.backgroundColor = "rgb(22 163 74)";

      if (numberOfRound.value < 20) {
        nextQuestion.value = true;
      } else if (numberOfRound.value === 20) {
        gameIsGoing.value = false;
        emit("gameIsGoing", gameIsGoing.value);
      }
    }
  }
};

const startNewGame = () => {
  clearTimeout(timeOutClear);

  gameIsGoing.value = true;
  emit("gameIsGoing", gameIsGoing.value);
  emit("closeMenu", false);
  reset();
  getRandomCountry();
};

const getRandomCountry = () => {
  clearTimeout(timeOutClear);
  time.value = 1;
  changeBgColor();
  userAnswered.value = false;
  nextQuestion.value = false;
  timeOut.value = false;

  if (notRepetiveCountries.value.length === countries.value.length) return;
  handleProgressBar();
  countryIndex.value = getRandomIndexCountry();

  if (notRepetiveCountries.value.includes(countryIndex.value)) {
    getRandomCountry();
    return;
  }

  numberOfRound.value++;
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
  quizEnd.value = false;
};
const summary = () => {
  countryIndex.value = null;
  quizEnd.value = true;
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
