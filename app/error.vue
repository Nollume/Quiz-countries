<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>

<template>
  <main class="mx-auto grid min-h-dvh max-w-xl place-content-center gap-5 px-6 text-center">
    <h1 class="text-3xl">{{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}</h1>
    <p>The quiz could not be displayed. Please try opening it again.</p>
    <button class="button" @click="clearError({ redirect: '/' })">Back to quiz</button>
  </main>
</template>
