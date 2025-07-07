<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    autoHeight?: boolean;
  }>(),
  {
    autoHeight: false
  }
);
</script>

<template>
  <div
    class="border-[.115rem] border-slate-200 bg-white flex rounded-sm text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    :class="{
      'h-12': !props.autoHeight
    }"
  >
    <slot> </slot>
  </div>
</template>
