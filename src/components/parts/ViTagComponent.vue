<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'delete', payload: string | number): void;
  (e: 'edit', payload: string | number): void;
}>();

const props = defineProps<{
  text: string | number;
}>();

const mode = ref<'edit' | 'delete' | null>();

function onClick() {
  if (mode.value === 'edit') {
    emit('edit', props.text);
  } else if (mode.value === 'delete') {
    emit('delete', props.text);
  }
}
</script>

<template>
  <div
    class="bg-white border-slate-200 border rounded-md p-1 flex items-center gap-1 cursor-pointer"
    @mouseover="mode = 'edit'"
    @mouseleave="mode = null"
    @click="onClick"
  >
    <div
      class="bg-red-500 rounded-full text-white w-5 aspect-square"
      :class="{ '!bg-sky-500': mode === 'edit' }"
      @mouseover.stop="mode = 'delete'"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-full"
        viewBox="0 0 24 24"
        v-show="mode === 'edit'"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M6 16c-.93 0-1.395 0-1.776-.102a3 3 0 0 1-2.122-2.121C2 13.395 2 12.93 2 12s0-1.395.102-1.777a3 3 0 0 1 2.122-2.12C4.605 8 5.07 8 6 8m6 8h6c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.121C22 13.395 22 12.93 22 12s0-1.395-.102-1.777a3 3 0 0 0-2.122-2.12C19.396 8 18.93 8 18 8h-6M7 3h2m2 0H9m0 0v18m0 0H7m2 0h2"
          color="currentColor"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-full"
        viewBox="0 0 24 24"
        v-show="mode !== 'edit'"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="m18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6"
          color="currentColor"
        />
      </svg>
    </div>
    <span>{{ props.text }}</span>
  </div>
</template>
