<script setup lang="ts">
import { computed, ref } from 'vue';
import ViPart from './base/ViPart.vue';
import { formatNumber } from '../utils/formatters';
import { deFormatNumber } from '../utils/formatters';

type InputType =
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'time';

type InputStatus = 'error' | 'warning' | 'true';

type AcceptType = string | RegExp;

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    datalist?: Array<string | number> | null;
    title?: string | null;
    placeholder?: string | null;
    type?: InputType;
    accept?: AcceptType;
    status?: InputStatus | null;
    format?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    list?: string | null;
    noFrame?: boolean;
    inputDir?: 'rtl' | 'ltr' | null;
    min?: string | number | Date | null;
    max?: string | number | Date | null;
    minlength?: number | null;
    maxlength?: number | null;
  }>(),
  {
    datalist: null,
    title: null,
    placeholder: null,
    type: 'text',
    status: null,
    format: false,
    disabled: false,
    readonly: false,
    required: undefined,
    list: null,
    noFrame: false,
    inputDir: null,
    min: null,
    max: null,
    minlength: null,
    maxlength: null
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const slots = defineSlots<{
  before?: () => any;
  after?: () => any;
}>();

const input = ref<HTMLInputElement>();
const focus = ref(false);
const showPassword = ref(false);
const openPopup = ref(false);
const stageOptionIndex = ref(0);

const focusMode = computed(() => {
  return focus.value && !props.disabled;
});

const value = computed({
  get() {
    return formatEncode(props.modelValue);
  },
  set(val: string | number) {
    emit('update:modelValue', formatDecode(val));
  }
});

const type = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text';
  return props.type || 'text';
});

const dataListFiltered = computed(() => {
  stageOptionIndex.value = 0;
  if (!props.datalist) return [];
  if (!value.value) return props.datalist;
  return props.datalist.filter((item) => {
    const itemStr = String(item).toLowerCase();
    const valueStr = String(value.value).toLowerCase();
    return itemStr.includes(valueStr) && itemStr !== valueStr;
  });
});

function formatEncode(val: string | number | undefined) {
  if (!props.format) return val;
  if (props.accept === 'number' && val) {
    return formatNumber(val);
  }
  return val;
}

function formatDecode(val: string | number) {
  if (!props.format) return val;
  if (props.accept === 'number' && val) {
    return deFormatNumber(val as string);
  }
  return val;
}

function handleKey(e: KeyboardEvent) {
  openPopup.value = true;

  if (dataListFiltered.value?.length) {
    if (e.code === 'ArrowDown') {
      stageOptionIndex.value++;
      if (stageOptionIndex.value >= dataListFiltered.value.length) {
        stageOptionIndex.value = dataListFiltered.value.length - 1;
      }
    }
    if (e.code === 'ArrowUp') {
      stageOptionIndex.value--;
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0;
      }
    }
    if (e.code === 'Enter') {
      input.value!.value = String(
        (value.value = dataListFiltered.value[stageOptionIndex.value])
      );
    }
  }
}

function onFocus() {
  openPopup.value = true;
  focus.value = true;
}

function onBlur() {
  focus.value = false;
  setTimeout(() => {
    openPopup.value = false;
  }, 100);
}

function onClickData(data: string | number) {
  focusInput();
  input.value!.value = String((value.value = data));
  openPopup.value = true;
}

function onClick(e: MouseEvent) {
  focusInput();
}

function focusInput() {
  input.value?.focus();
}

function onBeforeInput(e: Event) {
  const inputEvent = e as InputEvent;
  if (inputEvent.data === null) return;
  if (
    props.accept === 'number' &&
    (!/^[\d.]+$/.test(inputEvent.data) ||
      (inputEvent.data.includes('.') &&
        (inputEvent.target as HTMLInputElement).value.includes('.')))
  ) {
    inputEvent.preventDefault();
  }
}

defineExpose({ focusInput });

function formatMinMax(
  val: string | number | Date | null | undefined
): string | number | undefined {
  if (val === null) return undefined;
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return val;
}
</script>

<template>
  <ViPart
    :focused="focusMode"
    :status="status"
    :disabled="disabled"
    :noFrame="noFrame"
    :openPopup="!!(openPopup && dataListFiltered.length)"
    @clickOnBox="(e) => onClick(e)"
  >
    <template #before>
      <slot name="before"></slot>
    </template>
    <template #after>
      <slot name="after"></slot>
      <span class="h-full flex items-center" v-if="datalist !== null">
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
      <div class="max-h-[300px] overflow-y-auto" style="scrollbar-width: thin">
        <div
          class="hover:bg-slate-200 p-1 rounded-sm"
          v-for="(item, index) in dataListFiltered"
          :key="index"
          @click="onClickData(item)"
          :class="{ 'bg-slate-200': stageOptionIndex == index }"
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
        v-model="value"
        :type="type"
        :list="list || undefined"
        class="outline-0 w-full min-w-0 placeholder:text-slate-400 h-full"
        :class="{
          'opacity-0': props.title !== null && !(input?.value || focusMode),
          'pt-3': props.title
        }"
        @keydown="handleKey"
        @beforeinput="onBeforeInput"
        :required="props.required"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :placeholder="props.placeholder || undefined"
        :min="formatMinMax(props.min)"
        :max="formatMinMax(props.max)"
        :minlength="props.minlength || undefined"
        :maxlength="props.maxlength || undefined"
        :dir="inputDir || undefined"
        @focus="onFocus"
        @blur="onBlur"
      />
    </template>
  </ViPart>
</template>
