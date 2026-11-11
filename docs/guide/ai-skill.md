# اسکیل برای ایجنت‌های هوش مصنوعی

پوشه‌ی `skills/viputy/` در مخزن یک اسکیل (`SKILL.md` + چند مرجع) است که به ایجنت‌هایی مثل Claude Code، Hermes و Codex می‌گوید viputy چطور کار می‌کند: کدام کامپوننت برای چه کاری، قاعده‌های مهم (مقدار ISO، `status`، پاپ‌آپ، RTL)، تغییر ظاهر (گردی گوشه‌ها، رنگ، حالت غیرفعال، تم تیره)، ViQueryBuilder و مهاجرت از ۰.۳.

| فایل | محتوا |
|---|---|
| `SKILL.md` | انتخاب کامپوننت، قاعده‌ها، خلاصه‌ی تم و query builder، نکته‌های رایج |
| `references/components.md` | همه‌ی propها، رویدادها و slotها (از روی کد استخراج شده) |
| `references/theming.md` | همه‌ی توکن‌ها، نمونه‌ی گوشه‌ی تیز/نرم/گرد، تم تیره، حالت غیرفعال |
| `references/query-builder.md` | مدل داده، عملگرها، کلیدها، اعتبارسنجی، query string |
| `references/custom-inputs.md` | ساخت اینپوت از `ViField` و `ViPopup` |
| `references/migration-0.x.md` | جدول تغییر نام و تبدیل مقدار از ۰.۳ به ۱.۰ |

## نصب برای ایجنت

نصب در پروژه‌ی شما (به‌صورت پوشه‌ی اسکیل ایجنت):

```bash
# Claude Code
mkdir -p .claude/skills && cp -r node_modules/@mnr73/viputy/skills/viputy .claude/skills/

# Hermes
cp -r node_modules/@mnr73/viputy/skills/viputy ~/.hermes/skills/viputy
```

پوشه‌ی `skills` داخل پکیج npm هم منتشر می‌شود، پس بعد از `npm i @mnr73/viputy` در دسترس است. هر ایجنتی که فایل Markdown را می‌خواند می‌تواند `SKILL.md` را مستقیم بخواند.

## نگهداری

وقتی propی اضافه یا حذف می‌شود، `references/components.md` را با خواندن کامپوننت به‌روز کن. تست `tests/skill-samples.test.ts` نمونه‌کدهای اسکیل را می‌سازد و بررسی می‌کند فهرست توکن‌ها با `tokens.css` یکی باشد.
