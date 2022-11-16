// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],
  app: {
    head: {
      title: "Countries quiz",
      meta: [{ name: "description", content: "Countries Quiz" }],
    },
  },
});
