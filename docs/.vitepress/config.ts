import { defineConfig } from "vitepress";

const base = process.env.DOCS_BASE ?? "/viputy/";

const nav = (p: string) => [
  { text: p === "" ? "راهنما" : "Guide", link: `${p}/guide/` },
  { text: p === "" ? "کامپوننت‌ها" : "Components", link: `${p}/components/` }
];

export default defineConfig({
  base,
  title: "Viputy",
  cleanUrls: true,
  locales: {
    root: { label: "فارسی", lang: "fa", dir: "rtl", description: "اینپوت‌های Vue با پشتیبانی کامل فارسی و تقویم جلالی", themeConfig: { nav: nav("") } },
    en: { label: "English", lang: "en", dir: "ltr", link: "/en/", description: "Vue form inputs with first-class Persian and Jalali support", themeConfig: { nav: nav("/en") } }
  },
  themeConfig: { socialLinks: [{ icon: "github", link: "https://github.com/mnr73/viputy" }] }
});
