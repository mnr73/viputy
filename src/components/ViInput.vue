<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import ViPart from './base/ViPart.vue'
import { formatNumber } from '@/utils/formatters'
import { deFormatNumber } from '@/utils/formatters'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: [String, Number]
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
  type: {
    type: String,
    default: 'text',
    validator: (value) => {
      return [
        'number',
        'password',
        'search',
        'tel',
        'text',
        'email',
        'url',
        'date',
        'datetime-local',
        'month',
        'time'
      ].includes(value)
    }
  },
  accept: {
    type: [String, RegExp]
  },
  status: {
    type: String,
    default: null,
    validator: (value) => {
      return ['error', 'warning', 'true'].includes(value)
    }
  },
  format: {
    type: Boolean,
    default: false
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
  list: {
    type: String,
    default: null
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
  }
})

const input = useTemplateRef('input')
const focus = ref(false)
const showPassword = ref(false)
const openPopup = ref(false)
const stageOptionIndex = ref(0)
const focusMode = computed(() => {
  return focus.value && !props.disabled
})

const value = computed({
  get() {
    return formatEncode(props.modelValue)
  },
  set(value) {
    emit('update:modelValue', formatDecode(value))
  }
})

const type = computed(() => {
  if (props.type == 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const dataListFiltered = computed(() => {
  stageOptionIndex.value = 0
  if (!props.datalist) return []
  if (!value.value) return props.datalist
  return props.datalist.filter((item) => {
    const itemStr = String(item).toLowerCase()
    const valueStr = String(value.value).toLowerCase()
    return itemStr.includes(valueStr) && itemStr !== valueStr
  })
})

function formatEncode(val) {
  if (!props.format) {
    return val
  }
  if (props.accept === 'number' && val) {
    return formatNumber(val)
  }
  return val
}

function formatDecode(val) {
  if (!props.format) {
    return val
  }
  if (props.accept === 'number' && val) {
    return deFormatNumber(val)
  }
  return val
}

function handleKey(e) {
  openPopup.value = true

  if (dataListFiltered.value?.length && openPopup.value == true) {
    if (e.code == 'ArrowDown') {
      stageOptionIndex.value++
      if (stageOptionIndex.value >= dataListFiltered.value?.length) {
        stageOptionIndex.value = dataListFiltered.value?.length - 1
      }
    }
    if (e.code == 'ArrowUp') {
      stageOptionIndex.value--
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0
      }
    }
    if (e.code == 'Enter') {
      input.value.value = value.value =
        dataListFiltered.value[stageOptionIndex.value]
    }
  }
}

function onFocus() {
  openPopup.value = true
  focus.value = true
}

function onBlur() {
  focus.value = false
  setTimeout(() => {
    openPopup.value = false
  }, 100)
}

function onClickData(data) {
  focusInput()
  input.value.value = value.value = data
  openPopup.value = true
}

function onClick(e) {
  focusInput()
}

function focusInput() {
  input.value.focus()
}

function onBeforeInput(e) {
  if (e.data === null) return
  if (
    props.accept === 'number' &&
    (!/^[\d\.]+$/.test(e.data) || // Only allow digits and dot
      (e.data.includes('.') && e.target.value.includes('.'))) // Prevent second dot
  ) {
    return e.preventDefault()
  }
}

defineExpose({ focusInput })
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
        :list="list"
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
        :placeholder="props.placeholder"
        :min="props.min"
        :max="props.max"
        :minlength="props.minlength"
        :maxlength="props.maxlength"
        :dir="inputDir"
        @focus="onFocus"
        @blur="onBlur"
      />
    </template>
  </ViPart>
</template>
