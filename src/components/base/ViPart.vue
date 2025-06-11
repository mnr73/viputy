<script setup>
import { computed, ref, useSlots } from 'vue'
import ViFrame from './ViFrame.vue'
import ViNoFrame from './ViNoFrame.vue'

const emit = defineEmits(['clickOnBox'])
const slots = useSlots()
const props = defineProps({
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
  noFrame: {
    type: Boolean,
    default: false
  },
  focused: {
    type: Boolean,
    default: false
  },
  openPopup: {
    type: Boolean,
    default: false
  }
})

const hover = ref(false)
const hoverMode = computed(() => {
  return hover.value && !props.focused && !props.disabled
})

function onClick(e) {
  emit('clickOnBox', e)
}
</script>

<template>
  <component :is="noFrame === true ? ViNoFrame : ViFrame">
    <template #top>
      <slot name="top"></slot>
    </template>
    <template #bottom>
      <slot name="bottom"></slot>
    </template>
    <div class="relative w-full h-full" @keydown="handleKey" ref="element">
      <div
        class="w-full h-full"
        :class="{
          'px-2': noFrame === false,
          'opacity-70': props.disabled
        }"
        @mouseover="hover = true"
        @mouseleave="hover = false"
        @click.prevent="onClick"
      >
        <div class="flex w-full h-full items-center gap-2 relative">
          <slot name="before"></slot>
          <div class="w-full h-full relative">
            <slot name="main" :hoverMode="hoverMode"></slot>
          </div>
          <slot name="after"></slot>
          <span
            v-show="hoverMode || props.focused || props.status"
            class="block h-[.15rem] w-full absolute bottom-0 transition-all"
            :class="{
              'bg-sky-500': props.focused && props.status == null,
              'bg-slate-500': hoverMode && props.status == null,
              'bg-red-400': props.status == 'error',
              'bg-yellow-500': props.status == 'warning',
              'bg-green-500': props.status == 'true'
            }"
          ></span>
        </div>
      </div>
      <div
        class="h-0 w-fit max-w-full absolute -bottom-1 start-0 z-10"
        v-if="slots.popup"
        v-show="props.openPopup"
      >
        <div
          class="bg-white shadow-md border-slate-100 border rounded-md p-2 w-fit min-w-60 max-w-full top-0 start-0"
        >
          <slot name="popup">there is no options</slot>
        </div>
      </div>
    </div>
  </component>
</template>
