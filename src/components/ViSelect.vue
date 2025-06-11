<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import ViDropdown from './ViDropdown.vue'

const emit = defineEmits(['update:modelValue', 'search', 'change'])
const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array]
  },
  options: {
    type: Array
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
  compareKey: {
    type: String,
    default: 'id'
  },
  filter: {
    type: [Boolean, Array],
    default: false
  },
  search: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

const element = useTemplateRef('element')
const searchInput = useTemplateRef('searchInput')
const stageOptionIndex = ref(-1)
const filterText = ref(null)

const selectedOption = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const optionsFiltered = computed(() => {
  stageOptionIndex.value = -1
  if (!props.options) return []
  if (!filterText.value) return props.options
  if (props.filter !== false) {
    return props.options.filter((item) => {
      stageOptionIndex.value = 0
      if (typeof item === 'object' && item !== null) {
        if (props.filter === true) {
          return Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(String(filterText.value).toLowerCase())
        } else if (Array.isArray(props.filter)) {
          return props.filter
            .map((key) => {
              // this line for support key separator by .
              return key
                .split('.')
                .reduce(
                  (acc, k) => (acc && acc[k] !== undefined ? acc[k] : ''),
                  item
                )
            })
            .join(' ')
            .toLowerCase()
            .includes(String(filterText.value).toLowerCase())
        }
        return []
      } else {
        return String(item)
          .toLowerCase()
          .includes(String(filterText.value).toLowerCase())
      }
    })
  }
  return props.options
})

function checkSelected(val) {
  let selected = selectedOption.value

  if (props.multiple && Array.isArray(selected)) {
    if (typeof val === 'object' && val !== null) {
      return selected.some(
        (item) => item && item[props.compareKey] === val[props.compareKey]
      )
    } else {
      return selected.includes(val)
    }
  }
  return props.compareKey && val?.[props.compareKey] != undefined
    ? val?.[props.compareKey] == selected?.[props.compareKey]
    : val == selected
}

function onOptionClick(option) {
  filterText.value = null
  if (props.multiple) {
    let selected = Array.isArray(selectedOption.value)
      ? [...selectedOption.value]
      : []
    let exists =
      props.compareKey && typeof option === 'object'
        ? selected.some(
            (item) =>
              item && item[props.compareKey] === option[props.compareKey]
          )
        : selected.includes(option)

    if (!exists) {
      selected.push(option)
    } else {
      selected = selected.filter((item) =>
        props.compareKey && typeof option === 'object'
          ? item && item[props.compareKey] !== option[props.compareKey]
          : item !== option
      )
    }
    selectedOption.value = selected
  } else {
    selectedOption.value = option
    element.value.closeList()
  }
  element.value.focusInput()
  emit('change')
}

function handleKey(e) {
  if (optionsFiltered.value?.length) {
    if (e.code == 'ArrowDown') {
      e.preventDefault()
      element.value.openList()
      stageOptionIndex.value++
      if (stageOptionIndex.value >= optionsFiltered.value?.length) {
        stageOptionIndex.value = optionsFiltered.value?.length - 1
      }
    }
    if (e.code == 'ArrowUp') {
      e.preventDefault()
      element.value.openList()
      stageOptionIndex.value--
      if (stageOptionIndex.value < 0) {
        stageOptionIndex.value = 0
      }
    }
    if (e.code == 'Enter' && stageOptionIndex.value >= 0) {
      onOptionClick(optionsFiltered.value[stageOptionIndex.value])
    }
    if (e.code === 'Delete') {
      clearInput()
    }
    if (
      (e.code == 'Tab' || (e.code == 'KeyF' && e.ctrlKey == true)) &&
      (props.filter !== false || props.search)
    ) {
      e.preventDefault()
      element.value.openList()
      setTimeout(() => {
        searchInput.value.focus()
      }, 10)
    }
  }
}

function closePopup() {
  setTimeout(() => {
    stageOptionIndex.value = -1
  }, 100)
}

function clearInput() {
  if (props.multiple) {
    selectedOption.value = []
  } else {
    selectedOption.value = null
  }
  emit('change')
}
</script>

<template>
  <ViDropdown
    :title="props.title"
    :status="props.status"
    :disabled="props.disabled"
    :required="props.required"
    :noFrame="props.noFrame"
    @keydown="handleKey"
    ref="element"
    @closePopup="closePopup"
  >
    <template #after>
      <span
        class="w-5 aspect-square p-[1px] rounded-full bg-slate-500 hover:bg-red-500 cursor-pointer text-white flex items-center justify-center"
        @click="clearInput"
        v-show="
          (selectedOption && !props.multiple) ||
          (selectedOption?.length && props.multiple)
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-full"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="m18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6"
            color="currentColor"
          />
        </svg>
      </span>
    </template>
    <template #label>
      <slot name="label" :selected="selectedOption"> select your option </slot>
    </template>
    <template #popup>
      <div v-if="props.filter !== false || props.search === true">
        <input
          ref="searchInput"
          v-model="filterText"
          type="text"
          class="bg-slate-50 w-full rounded-md p-1 outline-0 mb-1 border border-slate-100"
          placeholder="search"
          @keyup="emit('search', filterText)"
        />
      </div>
      <div class="grid gap-1">
        <div
          v-for="(option, index) in optionsFiltered"
          :key="index"
          class="block bg-white hover:bg-slate-50 hover:border-e-slate-200 hover:border-e-4 p-2 cursor-pointer rounded-sm relative"
          :class="{
            '!bg-slate-50 border-s-4 border-s-sky-400': checkSelected(option),
            '!bg-slate-50 border-e-slate-200 border-e-4':
              stageOptionIndex == index
          }"
          @click="onOptionClick(option)"
        >
          <slot :option="option" name="option" />
        </div>
      </div>
    </template>
  </ViDropdown>
</template>
