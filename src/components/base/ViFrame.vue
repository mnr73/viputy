<script setup lang="ts">
defineOptions({
  inheritAttrs: false
});
</script>

<template>
  <div class="grid">
    <slot name="top"></slot>
    <div
      v-bind="$attrs"
      class="border-[.115rem] border-slate-100 bg-white flex h-12 rounded-sm text-slate-700"
    >
      <slot> </slot>
    </div>
    <slot name="bottom"></slot>
  </div>
</template>
