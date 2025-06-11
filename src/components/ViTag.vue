<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import ViPart from './base/ViPart.vue'
import ViTagComponent from './parts/ViTagComponent.vue'
import { onClickOutside } from '@vueuse/core'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: [Set]
  },
  datalist: {
    type: Array,
    default: null
  },
  title: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: null,
    validator: (value) => {
      return ['error', 'warning', 'true'].includes(value)
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: undefined
  },
  noFrame: {
    type: Boolean,
    default: false
  },
  inputDir: {
    type: String,
    default: null,
    validator: (value) => {
      return ['rtl', 'ltr'].includes(value)
    }
  },
  min: {
    type: [String, Number, Date],
    default: null
  },
  max: {
    type: [String, Number, Date],
    default: null
  },
  minlength: {
    type: Number,
    default: null
  },
  maxlength: {
    type: Number,
    default: null
  },
  hideTags: {
    type: Boolean,
    default: false
  }
})

const input = useTemplateRef('input')
const element = useTemplateRef('element')
const focus = ref(false)
const openPopup = ref(false)
const stageOptionIndex = ref(0)
const inputValue = ref()
const focusMode = computed(() => {
  return focus.value && !props.disabled
})

const datalist = computed(() => {
  return inputValue.value
    ? [inputValue.value, ...props.datalist]
    : props.datalist
})

const open = computed({
  get() {
    return openPopup.value
  },
  set(value) {
    if (value) {
      openPopup.value = true
    } else {
      inputValue.value = null
      openPopup.value = false
    }
  }
})

function blurInput() {
  input.value.blur()
}

onClickOutside(element, () => {
  open.value = false
})

function handleKey(e) {
  open.value = true

  if (e.code == 'Escape') {
    blurInput()
  }

  if (datalist.value?.length && openPopup.value == true) {
    if (e.code == 'ArrowDown') {
      stageOptionIndex.value++
      e.preventDefault()
      if (stageOptionIndex.value >= datalist.value?.length) {
        stageOptionIndex.value = datalist.value?.length - 1
      }
    }
    if (e.code == 'ArrowUp') {
      e.preventDefault()

      stageOptionIndex.value--
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0
      }
    }
    if (e.code == 'Enter') {
      e.preventDefault()
      onClickData(datalist.value[stageOptionIndex.value])
    }
    if (e.code == 'Tab') {
      open.value = false
    }
    if (e.code == 'Escape') {
      e.preventDefault()
      open.value = false
    }
  }
}

function onFocus() {
  open.value = true
  focus.value = true
}

function onBlur() {
  focus.value = false
}

function onClickData(data) {
  focusInput()
  props.modelValue.has(data)
    ? props.modelValue.delete(data)
    : props.modelValue.add(data)

  open.value = true
}

function onClick(e) {
  focusInput()
}

function focusInput() {
  input.value.focus()
}

function deleteTag(tag) {
  props.modelValue.delete(tag)
}

function editTag(tag) {
  deleteTag(tag)
  inputValue.value = tag
  stageOptionIndex.value = 0
  focusInput()
}

defineExpose({ focusInput })
</script>

<template>
  <ViPart
    :focused="props.focusMode"
    :status="props.status"
    :disabled="props.disabled"
    :noFrame="props.noFrame"
    :openPopup="!!(openPopup && datalist.length)"
    @clickOnBox="(e) => onClick(e)"
    ref="element"
  >
    <template #top v-if="!props.hideTags">
      <div
        v-show="props.modelValue.size"
        class="p-1 flex flex-wrap border border-slate-200 bg-slate-100 mb-1 rounded-md gap-1"
      >
        <ViTagComponent
          v-for="(item, index) in props.modelValue"
          :key="index"
          :text="item"
          @delete="deleteTag"
          @edit="editTag"
        />
      </div>
    </template>
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
      <div
        class="max-h-[300px] overflow-y-auto grid gap-1"
        style="scrollbar-width: thin"
      >
        <div
          class="hover:bg-slate-200 p-1 rounded-sm cursor-pointer"
          v-for="(item, index) in datalist"
          :key="index"
          @click="onClickData(item)"
          :class="{
            '!bg-slate-50 border-s-4 border-s-sky-400':
              props.modelValue.has(item),
            '!bg-slate-50 border-e-slate-200 border-e-4':
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
        :min="props.min"
        :max="props.max"
        :minlength="props.minlength"
        :maxlength="props.maxlength"
        :dir="inputDir"
        @input="stageOptionIndex = 0"
        @focus="onFocus"
        @blur="onBlur"
      />
    </template>
  </ViPart>
</template>
