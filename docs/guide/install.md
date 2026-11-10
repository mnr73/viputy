# نصب و استفاده

```bash
npm i @mnr73/viputy
```

```ts
// main.ts
import { createApp } from "vue";
import { viputy } from "@mnr73/viputy";
import "@mnr73/viputy/style.css";

createApp(App).use(viputy, { locale: "fa" }).mount("#app");
```

## با Tailwind 4

استایل‌ها داخل `@layer vi` هستند، پس هر CSS بدون لایه (و هر utility تیل‌ویند) روی آن‌ها برنده است. فایل را **قبل از** tailwind وارد کن:

```css
@import "@mnr73/viputy/style.css";
@import "tailwindcss";
```

## SSR

همه‌ی کامپوننت‌ها روی سرور رندر می‌شوند. به `window` فقط بعد از mount و بعد از باز شدن popup دسترسی داریم.
