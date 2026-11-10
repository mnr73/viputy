# Building a custom input

`ViField` gives the frame and status, `ViPopup` the panel, and `useField` (for native controls) hands out the a11y attributes.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ViField, ViPopup } from "@mnr73/viputy";

const color = defineModel<string>();
const open = ref(false);
const colors = ["#2563eb", "#15803d", "#c62828"];
</script>

<template>
  <ViField label="Colour" :active="open">
    <ViPopup v-model="open" mobile="sheet" title="Colour">
      <template #trigger="{ toggle, attrs }">
        <button v-bind="attrs" type="button" class="vi-native" @click="toggle">
          <span :style="{ background: color }" class="swatch" />
        </button>
      </template>
      <button v-for="c in colors" :key="c" @click="color = c; open = false">{{ c }}</button>
    </ViPopup>
  </ViField>
</template>
```

`ViSelect` is built from these same parts; for option lists see [useOptions and ViOptionList](/en/components/options). `ViDate` and `ViQueryBuilder` follow in the next phases.
