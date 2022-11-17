<template>
  <div
    class="min-h-screen bg-primary-800 text-primary-100 relative flex gap-4 overflow-hidden"
  >
    <div
      v-if="!openMenu"
      @click="openMenu = true"
      class="absolute w-8 h-8 right-6 top-4 z-40 p-0.5 border border-accent rounded-md cursor-pointer"
    >
      <IconMenu />
    </div>
    <Menu
      :openMenu="openMenu"
      @closeMenu="openMenu = $event"
      @optionsRegion="region = $event"
      @sendOptions="options = $event"
      :startGame="startGame"
      :stopGame="stopGame"
      :gameIsGoing="gameIsGoing"
    />
    <Quiz
      :region="region"
      :options="options"
      @closeMenu="openMenu = $event"
      @startGame="startGame = $event"
      @stopGame="stopGame = $event"
      @gameIsGoing="gameIsGoing = $event"
    />
  </div>
</template>

<script setup>
const startGame = ref(null);
const stopGame = ref(null);
const openMenu = ref(false);
const gameIsGoing = ref(false);
const region = ref("all");
const options = ref("flags");
</script>

<style scoped></style>
