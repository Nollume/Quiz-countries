<template>
  <div
    class="w-full min-h-screen px-6 flex flex-col gap-2 justify-between relative"
  >
    <QuizHintContainer
      :options="options"
      :region="region"
      :countryIndex="countryIndex"
      :countries="countries"
      :startNewGame="startNewGame"
    />
    <QuizEndResult v-if="quizEnd" :correct="correct" />
    <QuizScoreTimeInfo
      v-if="countryIndex !== null"
      :timeOut="timeOut"
      :correct="correct"
      :numberOfRound="numberOfRound"
    />
    <!-- progressBar -->
    <div
      class="relative w-full h-3 bg-primary-900 border border-accent"
      :class="{ hidden: countryIndex === null }"
    >
      <div
        class="absolute w-full inset-0 bg-accent origin-left"
        ref="progressBar"
      ></div>
    </div>

    <QuizOptionsContainer
      v-if="countryIndex !== null"
      :optionsCountries="optionsCountries"
      :countries="countries"
      :userReaction="userReaction"
    />
    <QuizBtnsNextTask
      :countryIndex="countryIndex"
      :gameIsGoing="gameIsGoing"
      :getRandomCountry="getRandomCountry"
      :nextQuestion="nextQuestion"
      :summary="summary"
    />
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

const emit = defineEmits(["closeMenu", "startGame", "stopGame", "gameIsGoing"]);
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

const reset = () => {
  countryIndex.value = null;
  notRepetiveCountries.value.length = 0;
  optionsCountries.value.length = 0;
  numberOfRound.value = 0;
  correct.value = 0;
  quizEnd.value = false;
};
const stopGame = () => {
  reset();
  emit("closeMenu", false);
  gameIsGoing.value = false;
  emit("gameIsGoing", gameIsGoing.value);
};
const summary = () => {
  countryIndex.value = null;
  quizEnd.value = true;
};

onMounted(() => {
  emit("startGame", startNewGame);
  emit("stopGame", stopGame);
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
