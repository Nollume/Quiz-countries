import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2026-09-15',
	css: ['~/assets/css/main.css'],
	vite: { plugins: [tailwindcss()] },
	runtimeConfig: {
		restCountriesApiKey: process.env.NUXT_REST_COUNTRIES_API_KEY,
	},
	app: {
		head: {
			title: 'Countries quiz',
			htmlAttrs: { lang: 'en' },
			meta: [{ name: 'description', content: 'Countries Quiz' }],
		},
	},
});
