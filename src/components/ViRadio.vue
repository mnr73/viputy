<script setup lang="ts">
import { computed } from 'vue';

type ModelValue = boolean | string | number | null;

interface Props {
  modelValue?: ModelValue;
  value?: ModelValue;
  name?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void;
  (e: 'on'): void;
  (e: 'off'): void;
}>();

const value = computed<ModelValue>({
  get() {
    return props.modelValue!;
  },
  set(val) {
    if (val) {
      emit('on');
    } else {
      emit('off');
    }
    emit('update:modelValue', val);
  }
});

const on = computed(() => {
  return value.value == props.value;
});
</script>

<template>
  <label
    class="flex gap-2 select-none items-center cursor-pointer"
    :class="{ '!cursor-not-allowed': props.disabled }"
  >
    <div
      class="bg-slate-100 border border-slate-200 h-7 w-7 rounded-full p-[1.6px] relative flex items-center justify-center"
      :class="{
        'opacity-60 bg-slate-200': props.disabled
      }"
      dir="ltr"
    >
      <input
        type="radio"
        :value="props.value"
        v-model="value"
        class="hidden"
        :name="props.name"
        :disabled="props.disabled"
      />
      <div
        class="border-6 rounded-full w-full aspect-square border-slate-300"
        :class="{
          '!border-sky-400 slide-on': on
        }"
      ></div>
    </div>
    <slot></slot>
  </label>
</template>

<style scoped>
@keyframes slide-on-animate {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.slide-on {
  animation-name: slide-on-animate;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
}
</style>
