<template>
  <div
    class="min-h-screen bg-primary-800 text-primary-100 relative flex gap-4 overflow-hidden"
  >
    <div
      v-if="!openMenu"
      @click="openMenu = true"
      class="absolute w-6 h-6 right-6 top-4 z-30 cursor-pointer"
    >
      <IconMenu />
    </div>
    <Menu
      :openMenu="openMenu"
      @closeMenu="openMenu = $event"
      @optionsRegion="region = $event"
      @sendOptions="options = $event"
    />
    <Quiz :region="region" :options="options" />
  </div>
</template>

<script setup>
const openMenu = ref(false);
const region = ref("all");
const options = ref("flag");
</script>

<style scoped></style>
