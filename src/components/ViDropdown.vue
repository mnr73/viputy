<script setup lang="ts">
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import ViPart from './base/ViPart.vue';

const emit = defineEmits<{
  (e: 'closePopup'): void;
  (e: 'openPopup'): void;
}>();

const props = withDefaults(
  defineProps<{
    title?: string | null;
    status?: 'error' | 'warning' | 'true' | null;
    disabled?: boolean;
    required?: boolean | undefined;
    noFrame?: boolean;
    actionKeys?: boolean;
    fullPopup?: boolean;
  }>(),
  {
    title: null,
    status: null,
    disabled: false,
    required: undefined,
    noFrame: false,
    actionKeys: true,
    fullPopup: false
  }
);

const input = ref<HTMLInputElement>();
const element = ref<HTMLElement>();

const openPopup = ref<boolean>(false);
const focus = ref<boolean>(false);

const focusMode = computed(() => {
  return (focus.value || openPopup.value) && !props.disabled;
});

function onBlur() {
  focus.value = false;
}

function onFocus() {
  focus.value = true;
}

function onClick() {
  focusInput();
  toggleList();
}

function openList() {
  openPopup.value = true;
  emit('openPopup');
}

function closeList() {
  openPopup.value = false;
  emit('closePopup');
}

function toggleList() {
  openPopup.value ? closeList() : openList();
}

function focusInput() {
  input.value?.focus();
}

function blurInput() {
  input.value?.blur();
}

onClickOutside(element, () => {
  closeList();
});

function handleKey(e: KeyboardEvent) {
  if (!props.actionKeys) return;
  if (e.code === 'Escape') {
    e.preventDefault();
    if (openPopup.value) {
      closeList();
    } else {
      blurInput();
    }
  }
  if (e.code === 'Tab') {
    closeList();
  }
  if (e.code === 'Enter') {
    e.preventDefault();
    closeList();
  }
  if (e.code === 'Space') {
    e.preventDefault();
    toggleList();
  }
}

function isOpen() {
  return openPopup.value;
}

defineExpose({
  focusInput,
  openList,
  closeList,
  toggleList,
  blurInput,
  isOpen
});
</script>

<template>
  <ViPart
    :focused="focusMode"
    :status="status"
    :disabled="disabled"
    :noFrame="noFrame"
    :openPopup="openPopup"
    :fullPopup="fullPopup"
    @clickOnBox="onClick"
    ref="element"
    @keydown="handleKey"
  >
    <template #before>
      <slot name="before"></slot>
    </template>
    <template #after>
      <slot name="after"></slot>
      <span class="h-full flex items-center">
        <span class="cursor-pointer h-full flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            :class="{ 'rotate-180': openPopup }"
            viewBox="0 0 48 48"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="4"
              d="M36 18L24 30L12 18"
            />
          </svg>
        </span>
      </span>
    </template>
    <template #popup>
      <slot name="popup">there is no options</slot>
    </template>
    <template #main="{ hoverMode }">
      <span
        v-if="props.title"
        class="absolute flex items-center transition-all top-0 h-fit text-xs"
      >
        <span
          class="text-slate-400"
          :class="{
            'text-slate-500': hoverMode,
            'text-slate-600': focusMode || input?.value
          }"
          >{{ props.title }}
          <span class="text-red-500" v-if="props.required">*</span></span
        >
      </span>
      <input
        ref="input"
        type="text"
        class="outline-0 w-0 h-0 opacity-0 absolute"
        @focus="onFocus"
        @blur="onBlur"
        readonly
      />
      <span
        class="w-full h-full flex items-center"
        :class="{
          '!pt-3': props.title
        }"
      >
        <slot name="label">click to toggle</slot>
      </span>
    </template>
  </ViPart>
</template>
