# تم و استایل

همه‌ی ظاهر با متغیرهای `--vi-*` کنترل می‌شود. روی `:root` یا هر عنصر والد override کن:

```css
:root {
  --vi-accent: #7c3aed;
  --vi-radius: 8px;
  --vi-height: 40px;
}
```

تم تیره با کلاس `dark` (یا `vi-theme-dark` یا `data-theme="dark"`) روی هر والد فعال می‌شود. Popup داخل `<body>` رندر می‌شود ولی تم را از والد trigger می‌گیرد.

هر بخش یک کلاس ثابت دارد (`vi-field__control` و ...) و prop `ui` اجازه می‌دهد کلاس دلخواه به هر بخش اضافه کنی.

| متغیر | کاربرد |
|---|---|
| `--vi-font` | فونت |
| `--vi-radius` / `-sm` / `-lg` | گوشه‌ها |
| `--vi-height` | ارتفاع فیلد |
| `--vi-field`, `--vi-field-hover`, `--vi-surface` | پس‌زمینه‌ها |
| `--vi-accent`, `--vi-accent-fg`, `--vi-accent-soft(-fg)`, `--vi-ring` | رنگ اصلی |
| `--vi-danger`, `--vi-warning`, `--vi-success` (+ `-soft`) | وضعیت‌ها |
| `--vi-border`, `--vi-border-strong`, `--vi-muted`, `--vi-fg` | حاشیه و متن |
| `--vi-shadow`, `--vi-scrim`, `--vi-z` | popup |
