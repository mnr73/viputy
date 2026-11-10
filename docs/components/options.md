# useOptions و ViOptionList

دو تکه‌ای که `ViSelect` از آن ساخته شده. با آن‌ها select، autocomplete یا هر انتخابگر دلخواه می‌سازی.

- `useOptions` رشته، شیء و گروه را نرمال می‌کند و بر اساس `query` فیلتر می‌کند (با یکسان‌سازی ی/ک).
- `ViOptionList` ردیف‌ها را رندر می‌کند: عنوان گروه، چک‌باکس، نیمه‌انتخاب، highlight تطابق و `aria-activedescendant`.
- `useListNav` کیبورد را می‌دهد، `ViPopup` پنل را.

مثال: یک انتخابگر ایمیل با جستجوی خودکار.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ViField, ViOptionList, ViPopup, useListNav, useOptions } from "@mnr73/viputy";

const model = defineModel<string>();
const open = ref(false);
const query = ref("");
const { rows } = useOptions({
  options: ["ali@a.com", "sara@b.com", "reza@c.com"],
  query
});
const nav = useListNav({
  count: () => rows.value.length,
  onSelect: (i) => {
    const r = rows.value[i];
    if (r?.kind === "option") pick(r.option.value as string);
  }
});
function pick(v: string) {
  model.value = v;
  open.value = false;
}
</script>

<template>
  <ViField label="ایمیل" :active="open">
    <input v-model="query" class="vi-native" @focus="open = true" @keydown="nav.onKeydown" />
    <ViPopup v-model="open" :close-on-outside="false">
      <ViOptionList
        id="mails"
        :rows="rows"
        :active="nav.active.value"
        :query="query"
        :is-selected="(o) => o.value === model"
        :group-state-of="() => 'none'"
        @pick="(o) => pick(o.value as string)"
      />
    </ViPopup>
  </ViField>
</template>
```

## useOptions(input)

| ورودی | توضیح |
|---|---|
| `options` | آرایه (ref یا getter) |
| `accessors` | `{ label, value, disabled, description, group }` |
| `query` | متن جستجو |
| `filter` | `false` یا تابع `(option, query) => boolean` |

خروجی: `groups`، `all`، `visible`، `rows`، `visibleOptions`، `groupState`.

## ViOptionList

Props: `rows`، `active`، `is-selected`، `group-state-of`، `multiple`، `query`، `id`، `label`. رویدادها: `pick`، `pick-group`، `hover`. Slotها: `option`، `group`.
