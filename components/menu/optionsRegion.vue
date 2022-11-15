<template>
  <form>
    <fieldset
      class="border border-accent rounded-md p-2 bg-primary-900 flex flex-col"
    >
      <legend class="px-2 text-lg text-center">Choose a quiz by region</legend>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="All">All</label>
        <input
          type="radio"
          name="regions"
          value="all"
          id="All"
          checked
          v-model="region"
        />
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="Europe">Europe</label>
        <input
          type="radio"
          name="regions"
          value="europe"
          id="Europe"
          v-model="region"
        />
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="Asia">Asia</label>
        <input
          type="radio"
          name="regions"
          value="asia"
          id="Asia"
          v-model="region"
        />
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="Africa">Africa</label>
        <input
          type="radio"
          name="regions"
          value="africa"
          id="Africa"
          v-model="region"
        />
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="Americas">Americas</label>
        <input
          type="radio"
          name="regions"
          value="americas"
          id="Americas"
          v-model="region"
        />
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <label class="cursor-pointer" for="Oceania">Oceania</label>
        <input
          type="radio"
          name="regions"
          value="oceania"
          id="Oceania"
          v-model="region"
        />
      </div>
    </fieldset>
  </form>
</template>

<script setup>
const region = ref("all");
const emit = defineEmits(["sendOptionsRegion"]);

watch(region, () => {
  emit("sendOptionsRegion", region.value);
});
</script>

<style lang="scss" scoped></style>
