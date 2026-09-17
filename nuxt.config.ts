import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2026-09-15',
	css: ['~/assets/css/main.css'],
	vite: { plugins: [tailwindcss()] },
	runtimeConfig: {
		restCountriesApiKey: '',
	},
	app: {
		head: {
			title: 'Countries quiz',
			htmlAttrs: { lang: 'en' },
			meta: [{ name: 'description', content: 'Countries Quiz' }],
		},
	},
});
