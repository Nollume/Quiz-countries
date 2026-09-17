<script setup lang="ts">
import type { Country, QuizMode } from '../../shared/types/country'

const props = defineProps<{ country: Country, mode: QuizMode }>()
const emit = defineEmits<{ ready: [] }>()
const state = ref<'loading' | 'ready' | 'error'>('loading')
const attempt = ref(0)
let timeout: ReturnType<typeof setTimeout> | undefined

function loaded() {
  clearTimeout(timeout)
  state.value = 'ready'
  emit('ready')
}
function failed() {
  clearTimeout(timeout)
  state.value = 'error'
}
function retry() {
  state.value = 'loading'
  attempt.value++
  timeout = setTimeout(failed, 10_000)
}
onMounted(() => {
  if (props.mode === 'capitals') loaded()
  else if (state.value === 'loading') timeout = setTimeout(failed, 10_000)
})
onBeforeUnmount(() => clearTimeout(timeout))
</script>

<template>
  <div class="panel flex min-h-60 items-center justify-center p-6 text-center" :aria-busy="state === 'loading'">
    <p v-if="mode === 'capitals'" class="text-3xl">{{ country.capitals.join(' / ') }}</p>
    <template v-else>
      <div v-if="state === 'error'" role="alert" class="space-y-4">
        <p>The flag could not be loaded.</p>
        <button class="secondary-button" @click="retry">Retry flag</button>
      </div>
      <template v-else>
        <p v-if="state === 'loading'" role="status">Loading flag…</p>
        <img :key="attempt" :src="country.flag || undefined" alt="Flag to identify" class="max-h-44 max-w-full object-contain" :class="{ hidden: state !== 'ready' }" @load="loaded" @error="failed">
      </template>
    </template>
  </div>
</template>
