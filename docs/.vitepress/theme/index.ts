import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "../../../src/styles/index.css";
import "./custom.css";
import {
    ViCheckbox,
    ViField,
    ViInput,
    ViPopup,
    ViRadio,
    ViOptionList,
    ViRadioGroup,
    ViSelect,
    ViSwitch,
    ViTag,
    ViText,
    viputy
} from "../../../src";

export default {
    extends: DefaultTheme,
    enhanceApp({ app, router }) {
        // The docs locale follows the URL: /en/... is English, the root is Persian.
        const isEn = () =>
            router.route.path.replace(/^\/viputy/, "").startsWith("/en/");
        app.use(viputy, { locale: () => (isEn() ? "en" : "fa") });
        Object.entries({
            ViCheckbox,
            ViField,
            ViInput,
            ViOptionList,
            ViPopup,
            ViRadio,
            ViRadioGroup,
            ViSelect,
            ViSwitch,
            ViTag,
            ViText
        }).forEach(([name, c]) => app.component(name, c));
    }
} satisfies Theme;
