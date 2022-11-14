<template>
  <div
    class="w-40 flex flex-col justify-between bg-indigo-300 min-h-screen shadow-lg shadow-gray-700"
  >
    <h1
      class="text-indigo-800 text-center text-2xl py-4 underline-offset-4 underline decoration-dashed"
    >
      Countries Quiz
    </h1>
    <button
      class="flex justify-evenly items-center mx-2 px-1 py-2.5 bg-indigo-600 text-indigo-100 rounded-md shadow-sm shadow-gray-700 border-dashed border border-indigo-100"
    >
      <IconNewGame class="w-5 h-5" />
      New Game
    </button>
    <form>
      <select name="options" >
        <option value="Flag">Flags</option>
        <option class="capitalize" value="Capital">capital cities</option>
      </select>
    </form>

    <form>
      <fieldset>
        <legend>Choose a quiz by region</legend>
        <label for="All">All</label>
        <input type="radio" name="regions" id="All" />
        <label for="Europe">Europe</label>
        <input type="radio" name="regions" id="Europe" />
        <label for="Asia">Asia</label>
        <input type="radio" name="regions" id="Asia" />
        <label for="Africa">Africa</label>
        <input type="radio" name="regions" id="Africa" />
        <label for="Americas">Americas</label>
        <input type="radio" name="regions" id="Americas" />
        <label for="Oceania">Oceania</label>
        <input type="radio" name="regions" id="Oceania" />
      </fieldset>
    </form>

    <div class="text-gray-800 px-2 py-4 flex flex-col items-center gap-2">
      <div
        class="border py-4 border-indigo-600 w-full flex justify-evenly items-center gap-1 shadow-sm shadow-gray-700"
      >
        <IconTime class="w-5 h-5" />
        <p>02:30</p>
      </div>
      <div
        class="border border-indigo-600 w-full flex flex-col items-center gap-1 shadow-sm shadow-gray-700"
      >
        <p>Score</p>
        <p>10 / 20</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped></style>
