<script setup>
import { ref, useTemplateRef } from 'vue';
import { onClickOutside } from '@vueuse/core';

const element = useTemplateRef('element');
const openPopup = ref(false);
const focus = ref(false);

const emit = defineEmits(['closePopup', 'openPopup']);
const props = defineProps({
  icon: {
    type: Boolean,
    default: true
  }
});

onClickOutside(element, () => {
  closeList();
});

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

function onBlur() {
  focus.value = false;
}

function onFocus() {
  focus.value = true;
}

defineExpose({ openList, closeList, toggleList });
</script>

<template>
  <div class="inline-block relative" ref="element">
    <div @click="toggleList">
      <input
        ref="input"
        type="text"
        class="outline-0 w-0 h-0 opacity-0 absolute"
        @focus="onFocus"
        @blur="onBlur"
        readonly
      />
      <slot name="body" :open="openPopup">
        <div
          class="inline-flex gap-1 cursor-pointer p-1 rounded-md"
          :class="{ 'bg-slate-50': focus }"
        >
          <slot name="icon" :open="openPopup">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 aspect-square"
              :class="{ 'rotate-180': openPopup }"
              viewBox="0 0 48 48"
              v-if="props.icon"
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
          </slot>
          <slot name="text" :open="openPopup">
            <span>your text</span>
          </slot>
        </div>
      </slot>
    </div>
    <div class="bg-blue-100 w-full absolute z-10 bottom-0 start-0">
      <div class="absolute top-1 start-0" v-show="openPopup">
        <slot name="popup">
          <div
            class="bg-white min-fit shadow-md border border-slate-200 rounded-md"
          >
            <slot name="popupContent">
              <div class="w-40 p-2">place your drop down content here</div>
            </slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
