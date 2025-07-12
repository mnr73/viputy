<script setup lang="ts">
import { computed, ref } from 'vue';
import ViFrame from './ViFrame.vue';
import ViNoFrame from './ViNoFrame.vue';

type StatusType = 'error' | 'warning' | 'true' | null;

const props = withDefaults(
  defineProps<{
    status?: StatusType;
    disabled?: boolean;
    noFrame?: boolean;
    focused?: boolean;
    openPopup?: boolean;
    fullPopup?: boolean;
    autoHeight?: boolean;
  }>(),
  {
    status: null,
    disabled: false,
    noFrame: false,
    focused: false,
    openPopup: false,
    fullPopup: false,
    autoHeight: false
  }
);

const emit = defineEmits<{
  (e: 'clickOnBox', event: MouseEvent): void;
}>();

const hover = ref(false);
const hoverMode = computed(() => {
  return hover.value && !props.focused && !props.disabled;
});

function onClick(e: MouseEvent) {
  emit('clickOnBox', e);
}
</script>

<template>
  <component
    :is="noFrame === true ? ViNoFrame : ViFrame"
    v-bind="noFrame === false ? { autoHeight: props.autoHeight } : {}"
  >
    <template #top>
      <slot name="top"></slot>
    </template>
    <template #bottom>
      <slot name="bottom"></slot>
    </template>
    <div class="relative w-full h-full" ref="element">
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
              'bg-slate-500 dark:bg-zinc-500':
                hoverMode && props.status == null,
              'bg-red-400': props.status == 'error',
              'bg-yellow-500': props.status == 'warning',
              'bg-green-500': props.status == 'true'
            }"
          ></span>
        </div>
      </div>
      <div
        class="h-0 w-full absolute -bottom-1 start-0 z-10"
        v-if="$slots.popup"
        v-show="props.openPopup"
      >
        <div
          class="bg-white dark:bg-zinc-700 shadow-md border-slate-100 dark:border-zinc-500 border rounded-md p-2 min-w-60 top-0 start-0"
          :class="{
            'w-full': props.fullPopup,
            'w-fit': !props.fullPopup
          }"
        >
          <slot name="popup">there is no options</slot>
        </div>
      </div>
    </div>
  </component>
</template>
