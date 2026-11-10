# ViField

قاب مشترک همه‌ی اینپوت‌ها: برچسب، فریم، وضعیت، پیام و slotها. هر اینپوت کاستوم هم روی همین ساخته می‌شود.

<div class="demo">
  <ViField label="نام کاربری" hint="فقط حروف انگلیسی و عدد" required>
    <template #default="{ id }"><input :id="id" class="vi-native" placeholder="نام کاربری را وارد کنید" /></template>
  </ViField>
  <ViField label="ایمیل" message="ایمیل معتبر نیست" status="error">
    <template #default="{ id }"><input :id="id" class="vi-native" value="milad@" dir="ltr" /></template>
  </ViField>
  <ViField label="کد ملی" disabled>
    <template #default="{ id }"><input :id="id" class="vi-native" disabled value="0012345678" /></template>
  </ViField>
</div>

```vue
<ViField label="نام کاربری" hint="فقط حروف انگلیسی و عدد" required>
  <template #default="{ id }">
    <input :id="id" class="vi-native" />
  </template>
</ViField>

<ViField label="ایمیل" message="ایمیل معتبر نیست" status="error">…</ViField>
```

## Props

| Prop | نوع | توضیح |
|---|---|---|
| `label` | `string` | برچسب |
| `hint` | `string` | متن راهنما زیر فیلد |
| `message` | `string` | پیام اعتبارسنجی؛ جای `hint` نمایش داده می‌شود |
| `status` | `"error" \| "warning" \| "success"` | رنگ و `aria-invalid` |
| `required` / `disabled` / `readonly` | `boolean` | |
| `bare` | `boolean` | بدون فریم |
| `active` | `boolean` | ظاهر focus اجباری (برای اینپوت‌های popup‌دار) |
| `ui` | `{ root, head, label, control, main, message }` | کلاس اضافه برای هر بخش |

## Slotها

`default` (با `{ id }`)، `label`، `meta` (کنار برچسب، مثلاً شمارنده)، `before`، `after`.
