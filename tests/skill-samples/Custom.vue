<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ViField,
  ViPopup,
  useOptions,
  useListNav,
  ViOptionList
} from "../../src";
const color = defineModel<string>();
const open = ref(false);
const field = ref();
const anchor = computed(() => field.value?.control ?? null);
const query = ref("");
const { rows } = useOptions({
  options: [{ name: "a", id: 1 }],
  accessors: { label: "name", value: "id" },
  query
});
const nav = useListNav({ count: () => rows.value.length, onSelect: () => {} });
</script>
<template>
  <ViField
    ref="field"
    label="Colour"
    :active="open"
    @control-click="open = !open"
  >
    <button type="button" class="vi-native" @click.stop="open = !open">
      {{ color }}
    </button>
  </ViField>
  <ViPopup v-model="open" :anchor="anchor" mobile="sheet" title="Colour">
    <ViOptionList
      :rows="rows"
      :active="nav.active.value"
      :is-selected="() => false"
      :group-state-of="() => 'none'"
      id="x"
    />
  </ViPopup>
</template>
