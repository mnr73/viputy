import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "../../../src/styles/index.css";
import "./custom.css";
import { ViField, ViPopup } from "../../../src";

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component("ViField", ViField);
        app.component("ViPopup", ViPopup);
    }
} satisfies Theme;
