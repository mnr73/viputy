# Install & use

```bash
npm i @mnr73/viputy
```

```ts
// main.ts
import { createApp } from "vue";
import { viputy } from "@mnr73/viputy";
import "@mnr73/viputy/style.css";

createApp(App).use(viputy, { locale: "en" }).mount("#app");
```

## With Tailwind 4

All rules sit in `@layer vi`, so any unlayered CSS (and every Tailwind utility) wins. Import the file **before** Tailwind:

```css
@import "@mnr73/viputy/style.css";
@import "tailwindcss";
```

## SSR

Every component renders on the server. `window` is only touched after mount and after a popup opens.
