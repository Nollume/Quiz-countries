<template>
  <div
    class="px-6 py-6 absolute w-full flex flex-col justify-between bg-primary-800 min-h-screen translate-x-full duration-300 ease-out z-50"
    :class="{ 'translate-x-0 ': openMenu }"
  >
    <button
      @click="emit('closeMenu', false)"
      class="absolute w-8 h-8 right-6 top-4 z-50 p-0.5 border border-accent rounded-md"
    >
      <IconCross />
    </button>

    <MenuOptions
      :gameIsGoing="gameIsGoing"
      @sendOptions="emit('sendOptions', $event)"
    />

    <MenuOptionsRegion
      :gameIsGoing="gameIsGoing"
      @send-options-region="emit('optionsRegion', $event)"
    />
    <div class="flex flex-col gap-2">
      <QuizStartGameBtn v-if="gameIsGoing" title="Stop Game" @click="stopGame">
        <IconStop
          class="w-6 h-6 absolute text-primary-100 right-4 top-1/2 -translate-y-1/2"
        />
      </QuizStartGameBtn>
      <QuizStartGameBtn title="New Game" @click="startGame"
        ><IconNewGame
          class="w-6 h-6 absolute text-primary-100 right-4 top-1/2 -translate-y-1/2"
      /></QuizStartGameBtn>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  openMenu: { type: Boolean },
  startGame: Function,
  stopGame: Function,
  gameIsGoing: Boolean,
});
const emit = defineEmits(["closeMenu", "optionsRegion", "sendOptions"]);
</script>

<style scoped></style>
