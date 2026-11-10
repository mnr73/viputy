# ViPopup

پنل شناور (یا bottom-sheet روی موبایل) که به یک trigger وصل است. پایه‌ی select، تقویم و QueryBuilder.

<script setup>
import { ref } from "vue";
const open = ref(false);
</script>

<div class="demo">
  <ViPopup v-model="open" title="عنوان">
    <template #trigger="{ toggle, attrs }">
      <button class="demo-btn" v-bind="attrs" @click="toggle">باز کردن</button>
    </template>
    <div style="padding: 8px">محتوای دلخواه. صفحه را کوچک کن تا حالت موبایل را ببینی.</div>
  </ViPopup>
</div>

```vue
<ViPopup v-model="open" title="عنوان" mobile="sheet">
  <template #trigger="{ toggle, attrs }">
    <button v-bind="attrs" @click="toggle">باز کردن</button>
  </template>
  محتوا
</ViPopup>
```

## رفتار

- **جهت عمودی:** اگر پایین جا نباشد و بالا جای بیشتری باشد، بالا باز می‌شود. اگر هیچ‌کدام جا نداشت ارتفاع محدود و scroll می‌شود.
- **جهت افقی:** از لبه‌ی چپ/راست صفحه بیرون نمی‌زند. `align="start"` در RTL به لبه‌ی راست trigger می‌چسبد.
- **موبایل** (عرض ≤ `breakpoint`، پیش‌فرض ۶۴۰): `mobile="sheet"` پایین صفحه، `"fullscreen"` تمام‌صفحه، `false` همان popover. اسکرول صفحه قفل و focus داخل پنل نگه داشته می‌شود.
- `Esc` و کلیک بیرون می‌بندد؛ بعد از بستن focus به عنصر قبلی برمی‌گردد.
- پیش‌فرض anchor همان trigger است. برای اینپوت‌ها `anchor` را عنصر `ViField` بده و `match-width` بزن تا پنل هم‌عرض فیلد شود.
- پنل در `<body>` رندر می‌شود تا هیچ `overflow` آن را نبرد.

## Props

| Prop | پیش‌فرض | توضیح |
|---|---|---|
| `modelValue` | `false` | باز/بسته (`v-model`) |
| `anchor` | trigger | عنصر مرجع موقعیت |
| `side` | `"bottom"` | `"bottom" \| "top"` |
| `align` | `"start"` | `"start" \| "center" \| "end"` |
| `offset` | `6` | فاصله از anchor (px) |
| `matchWidth` | `false` | هم‌عرض anchor |
| `mobile` | `"sheet"` | `"sheet" \| "fullscreen" \| false` |
| `breakpoint` | `640` | |
| `title` | | عنوان sheet و `aria-label` |
| `closeOnOutside` | `true` | |
| `autoScroll` | `true` | وقتی پنل نه بالا جا دارد نه پایین، صفحه کمی اسکرول می‌شود تا پنل کامل دیده شود. `false`: صفحه هیچ‌وقت حرکت نمی‌کند و پنل درون خودش اسکرول می‌خورد |
| `restoreFocus` | `true` | هنگام بستن، فوکوس به المان قبلی برمی‌گردد |
| `teleport` | `true` | |

Slotها: `trigger` (`open`, `toggle`, `attrs`)، `default` (`close`, `sheet`)، `footer` (فقط sheet). رویدادها: `open`، `close`.
