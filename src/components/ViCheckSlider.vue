<script setup lang="ts">
import { computed } from 'vue';

type ModelValue = boolean | Array<string | number | null>;
type CheckboxValue = number | string | null;

const props = withDefaults(
  defineProps<{
    modelValue: ModelValue;
    value: CheckboxValue;
    name?: string;
    disabled?: boolean;
  }>(),
  {
    value: null,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void;
  (e: 'on'): void;
  (e: 'off'): void;
}>();

const value = computed<ModelValue>({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    if (newValue) {
      emit('on');
    } else {
      emit('off');
    }
    emit('update:modelValue', newValue);
  }
});

const on = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  } else {
    return props.modelValue;
  }
});
</script>

<template>
  <label
    class="flex gap-2 select-none items-center cursor-pointer"
    :class="{ '!cursor-not-allowed': props.disabled }"
  >
    <div
      class="bg-slate-100 border border-slate-200 h-6 w-10 rounded-full p-[1.6px] relative"
      :class="{
        'opacity-60 bg-slate-300': props.disabled
      }"
      dir="ltr"
    >
      <input
        type="checkbox"
        :value="props.value"
        v-model="value"
        class="hidden"
        :name="props.name"
        :disabled="props.disabled"
      />
      <div
        class="bg-gray-400 h-full aspect-square rounded-full"
        :class="{
          '!bg-sky-500 slide-on': on,
          'slide-off': !on
        }"
      ></div>
    </div>
    <slot></slot>
  </label>
</template>

<style scoped>
@keyframes slide-off-animate {
  0% {
    margin-inline-start: calc(var(--spacing) * 4);
  }
  100% {
    margin-inline-start: 0;
  }
}
@keyframes slide-on-animate {
  0% {
    margin-inline-start: 0;
  }
  100% {
    margin-inline-start: calc(var(--spacing) * 4);
  }
}

.slide-off {
  animation-name: slide-off-animate;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

.slide-on {
  animation-name: slide-on-animate;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}
</style>
