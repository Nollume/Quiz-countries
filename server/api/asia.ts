export default defineEventHandler(async (e) => {
    if (e.req.method === "GET") {
      const response = await $fetch(
        `https://restcountries.com/v3.1/region/asia`
      );
      return response;
    }
  });
  