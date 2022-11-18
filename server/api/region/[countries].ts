export default defineEventHandler(async (e) => {
  const { countries } = e.context.params;

  const response = await $fetch(
    `https://restcountries.com/v3.1/region/${countries}`
  );

  return response;
});
