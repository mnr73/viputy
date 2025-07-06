<script setup lang="ts">
import { computed, ref } from 'vue';
import ViPart from './base/ViPart.vue';

type InputStatus = 'error' | 'warning' | 'true';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    title?: string | null;
    placeholder?: string | null;
    status?: InputStatus | null;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    noFrame?: boolean;
    inputDir?: 'rtl' | 'ltr' | null;
    minlength?: number | null;
    maxlength?: number | null;
    rows?: number;
    cols?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    showDetails?: boolean;
  }>(),
  {
    title: null,
    placeholder: null,
    status: null,
    disabled: false,
    readonly: false,
    required: undefined,
    noFrame: false,
    inputDir: null,
    minlength: null,
    maxlength: null,
    rows: 3,
    resize: 'vertical',
    showDetails: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'input', value: string): void;
}>();

defineSlots<{
  before?: () => any;
  after?: () => any;
}>();

const textarea = ref<HTMLTextAreaElement>();
const focus = ref(false);

const focusMode = computed(() => {
  return focus.value && !props.disabled;
});

const value = computed({
  get() {
    return props.modelValue || '';
  },
  set(val: string) {
    emit('update:modelValue', val);
  }
});

const currentLength = computed(() => {
  return value.value.length;
});

function onFocus() {
  focus.value = true;
}

function onBlur() {
  focus.value = false;
}

function onClick(e: MouseEvent) {
  focusInput();
}

function focusInput() {
  textarea.value?.focus();
}

function onInput(e: Event) {
  emit('input', (e.target as HTMLTextAreaElement).value);
}

defineExpose({ focusInput });
</script>

<template>
  <ViPart
    :focused="focusMode"
    :status="props.status"
    :disabled="props.disabled"
    :noFrame="props.noFrame"
    :autoHeight="true"
    @clickOnBox="(e) => onClick(e)"
  >
    <template #main="{ hoverMode }">
      <div
        v-if="props.title"
        class="flex gap-2 items-start transition-all py-1"
      >
        <slot name="before"></slot>
        <span
          class="text-slate-400"
          :class="{
            'text-slate-500': hoverMode,
            'text-slate-600': focusMode || textarea?.value
          }"
          >{{ props.title }}
          <span class="text-red-500" v-if="props.required">*</span></span
        >
        <slot name="after"></slot>
      </div>
      <hr class="border-slate-200 my-0" v-if="props.title" />
      <textarea
        ref="textarea"
        v-model="value"
        class="outline-0 w-full min-w-0 placeholder:text-slate-400 min-h-[3rem] resize-none"
        :class="{
          'pt-1': props.title,
          'resize-none': props.resize === 'none',
          resize: props.resize === 'both',
          'resize-x': props.resize === 'horizontal',
          'resize-y': props.resize === 'vertical'
        }"
        @input="onInput"
        :required="props.required"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :placeholder="props.placeholder || undefined"
        :minlength="props.minlength || undefined"
        :maxlength="props.maxlength || undefined"
        :rows="props.rows"
        :cols="props.cols"
        :dir="inputDir || undefined"
        @focus="onFocus"
        @blur="onBlur"
      ></textarea>
      <div
        v-if="props.showDetails"
        class="text-xs text-slate-500 my-1 text-end"
      >
        {{ currentLength }}{{ props.maxlength ? ` / ${props.maxlength}` : '' }}
      </div>
    </template>
  </ViPart>
</template>
