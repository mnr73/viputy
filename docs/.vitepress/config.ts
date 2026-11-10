import { defineConfig } from "vitepress";

const base = process.env.DOCS_BASE ?? "/viputy/";

const nav = (p: string) => [
    { text: p === "" ? "راهنما" : "Guide", link: `${p}/guide/` },
    { text: p === "" ? "کامپوننت‌ها" : "Components", link: `${p}/components/` }
];

// One list drives both languages. Add a page here and create docs/<name>.md + docs/en/<name>.md.
const components: Array<[string, string]> = [
    ["ViField", "field"],
    ["ViPopup", "popup"],
    ["ViInput", "input"],
    ["ViText", "text"],
    ["ViSelect", "select"],
    ["ViTag", "tag"],
    ["ViCheckbox / ViRadio / ViSwitch", "choice"]
];

const sidebar = (p: string, fa: boolean) => ({
    [`${p}/guide/`]: [
        {
            text: fa ? "شروع" : "Start",
            items: [
                { text: fa ? "معرفی" : "Introduction", link: `${p}/guide/` },
                {
                    text: fa ? "نصب و استفاده" : "Install & use",
                    link: `${p}/guide/install`
                },
                {
                    text: fa ? "تم و استایل" : "Theming",
                    link: `${p}/guide/theming`
                },
                {
                    text: fa ? "زبان و RTL" : "Locale & RTL",
                    link: `${p}/guide/i18n`
                }
            ]
        }
    ],
    [`${p}/components/`]: [
        {
            text: fa ? "کامپوننت‌ها" : "Components",
            items: [
                {
                    text: fa ? "نمای کلی" : "Overview",
                    link: `${p}/components/`
                },
                ...components.map(([text, name]) => ({
                    text,
                    link: `${p}/components/${name}`
                }))
            ]
        },
        {
            text: fa ? "ساخت اینپوت کاستوم" : "Custom inputs",
            items: [
                {
                    text: fa ? "راهنما" : "Guide",
                    link: `${p}/components/custom`
                },
                {
                    text: "useOptions / ViOptionList",
                    link: `${p}/components/options`
                }
            ]
        }
    ]
});

export default defineConfig({
    base,
    title: "Viputy",
    cleanUrls: true,
    locales: {
        root: {
            label: "فارسی",
            lang: "fa",
            dir: "rtl",
            description: "اینپوت‌های Vue با پشتیبانی کامل فارسی و تقویم جلالی",
            themeConfig: { nav: nav(""), sidebar: sidebar("", true) }
        },
        en: {
            label: "English",
            lang: "en",
            dir: "ltr",
            link: "/en/",
            description:
                "Vue form inputs with first-class Persian and Jalali support",
            themeConfig: { nav: nav("/en"), sidebar: sidebar("/en", false) }
        }
    },
    themeConfig: {
        socialLinks: [
            { icon: "github", link: "https://github.com/mnr73/viputy" }
        ]
    }
});
