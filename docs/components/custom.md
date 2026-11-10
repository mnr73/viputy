# ساخت اینپوت کاستوم

`ViField` قاب و وضعیت را می‌دهد، `ViPopup` پنل را، و `useField` (برای کنترل‌های native) ویژگی‌های a11y را می‌رساند.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ViField, ViPopup } from "@mnr73/viputy";

const color = defineModel<string>();
const open = ref(false);
const colors = ["#2563eb", "#15803d", "#c62828"];
</script>

<template>
  <ViField label="رنگ" :active="open">
    <ViPopup v-model="open" mobile="sheet" title="رنگ">
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

`ViSelect` هم با همین اجزا ساخته شده؛ برای لیست گزینه‌دار ببین [useOptions و ViOptionList](/components/options). `ViDate` و `ViQueryBuilder` در فازهای بعد می‌آیند.
