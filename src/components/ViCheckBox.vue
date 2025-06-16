<script setup lang="ts">
import { computed } from 'vue';

// نوع پراپرتی‌ها
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
    class="inline-flex gap-2 select-none items-center cursor-pointer"
    :class="{ '!cursor-not-allowed': props.disabled }"
  >
    <div
      class="bg-slate-100 border-3 border-slate-200 h-7 w-7 rounded-md p-[1.6px] relative"
      :class="{
        'opacity-60 bg-slate-300': props.disabled,
        '!border-sky-400': on
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        class="text-slate-400"
        :class="{ '!text-sky-500': on }"
        viewBox="0 0 16 16"
      >
        <path
          fill="currentColor"
          d="M7.3 14.2L.2 9l1.7-2.4l4.8 3.5l6.6-8.5l2.3 1.8z"
        />
      </svg>
    </div>
    <slot></slot>
  </label>
</template>
