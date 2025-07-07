<script setup lang="ts">
import { computed, ref } from 'vue';
import ViPart from './base/ViPart.vue';
import ViTagComponent from './parts/ViTagComponent.vue';
import { onClickOutside } from '@vueuse/core';

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number | undefined)[]): void;
}>();

const props = defineProps<{
  modelValue?: (string | number)[];
  datalist?: string[] | null;
  title?: string | null;
  placeholder?: string;
  status?: 'error' | 'warning' | 'true' | null;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  noFrame?: boolean;
  inputDir?: 'rtl' | 'ltr';
  min?: number;
  max?: number;
  minlength?: number;
  maxlength?: number;
  hideTags?: boolean;
}>();

const input = ref<HTMLInputElement>();
const element = ref<HTMLElement>();
const focus = ref<boolean>(false);
const openPopup = ref(false);
const stageOptionIndex = ref(0);
const inputValue = ref<string | number | undefined>();

const focusMode = computed<boolean>(() => {
  return focus.value && !props.disabled;
});

const datalist = computed(() => {
  const data = props.datalist || [];
  return inputValue.value ? [inputValue.value, ...data] : data;
});

const open = computed({
  get() {
    return openPopup.value;
  },
  set(value: boolean) {
    if (value) {
      openPopup.value = true;
    } else {
      inputValue.value = undefined;
      openPopup.value = false;
    }
  }
});

function blurInput() {
  input.value?.blur();
}

onClickOutside(element, () => {
  open.value = false;
});

function handleKey(e: KeyboardEvent) {
  open.value = true;

  if (e.code === 'Escape') {
    blurInput();
  }

  if (datalist.value.length && openPopup.value) {
    if (e.code === 'ArrowDown') {
      stageOptionIndex.value++;
      e.preventDefault();
      if (stageOptionIndex.value >= datalist.value.length) {
        stageOptionIndex.value = datalist.value.length - 1;
      }
    }
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      stageOptionIndex.value--;
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0;
      }
    }
    if (e.code === 'Enter') {
      e.preventDefault();
      onClickData(datalist.value[stageOptionIndex.value]);
    }
    if (e.code === 'Tab') {
      open.value = false;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      open.value = false;
    }
  }
}

function onFocus() {
  open.value = true;
  focus.value = true;
}

function onBlur() {
  focus.value = false;
}

const value = computed<(string | number)[]>({
  get() {
    return props.modelValue || [];
  },
  set(val: (string | number)[]) {
    emit('update:modelValue', val);
  }
});

function onClickData(data: string | number) {
  focusInput();
  const list = new Set(value.value);
  list.has(data) ? list.delete(data) : list.add(data);
  value.value = Array.from(list);
  open.value = true;
}

function onClick(e: MouseEvent) {
  focusInput();
}

function focusInput() {
  input.value?.focus();
}

function deleteTag(tag: string | number) {
  value.value = value.value.filter((item) => item !== tag);
}

function editTag(tag: string | number) {
  deleteTag(tag);
  inputValue.value = tag;
  stageOptionIndex.value = 0;
  focusInput();
}

defineExpose({ focusInput });
</script>

<template>
  <div>
    <div
      v-if="!props.hideTags"
      v-show="value?.length"
      class="p-1 flex flex-wrap border border-slate-200 bg-slate-100 dark:bg-zinc-700 dark:border-zinc-500 mb-1 rounded-md gap-1"
    >
      <ViTagComponent
        v-for="(item, index) in value"
        :key="index"
        :text="item"
        @delete="deleteTag"
        @edit="editTag"
      />
    </div>
    <ViPart
      :focused="focusMode"
      :status="props.status"
      :disabled="props.disabled"
      :noFrame="props.noFrame"
      :openPopup="!!(openPopup && datalist?.length)"
      @clickOnBox="(e) => onClick(e)"
      ref="element"
    >
      <template #before>
        <slot name="before"></slot>
      </template>
      <template #after>
        <slot name="after"></slot>
        <span class="h-full flex items-center" v-if="props.datalist !== null">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-slate-400"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19.696 8.72a1.2 1.2 0 0 1-.3.64l-6.09 6.76a1.85 1.85 0 0 1-.58.46a1.7 1.7 0 0 1-1.42.03a1.75 1.75 0 0 1-.62-.42l-6.1-6.83a1.3 1.3 0 0 1-.31-.64a1.31 1.31 0 0 1 .56-1.26a1.36 1.36 0 0 1 .68-.21h13a1.29 1.29 0 0 1 1.15.76c.081.228.092.476.03.71"
            />
          </svg>
        </span>
      </template>
      <template #popup>
        <div
          class="max-h-[300px] overflow-y-auto grid gap-1"
          style="scrollbar-width: thin"
        >
          <div
            class="hover:bg-slate-200 dark:hover:bg-zinc-600 p-1 rounded-sm cursor-pointer"
            v-for="(item, index) in datalist"
            :key="index"
            @click="onClickData(item)"
            :class="{
              '!bg-slate-50 border-s-4 border-s-sky-400 dark:!bg-zinc-800':
                (Array.isArray(value) ? value : []).includes(item),
              '!bg-slate-50 border-e-slate-200 border-e-4 dark:!bg-zinc-800':
                stageOptionIndex == index
            }"
          >
            {{ item }}
          </div>
        </div>
      </template>
      <template #main="{ hoverMode }">
        <span
          v-if="props.title"
          class="absolute h-full flex items-center transition-all top-0"
          :class="{
            '!h-fit text-xs': focusMode || input?.value
          }"
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
          class="outline-0 w-full min-w-0 placeholder:text-slate-400 h-full"
          :class="{
            'opacity-0': props.title !== null && !(input?.value || focusMode),
            'pt-3': props.title
          }"
          @keydown="handleKey"
          v-model="inputValue"
          :required="props.required"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :placeholder="props.placeholder"
          :minlength="props.minlength"
          :maxlength="props.maxlength"
          :dir="inputDir"
          @input="stageOptionIndex = 0"
          @focus="onFocus"
          @blur="onBlur"
        />
      </template>
    </ViPart>
  </div>
</template>
