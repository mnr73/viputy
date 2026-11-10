import { mount } from "@vue/test-utils";
import { renderToString } from "vue/server-renderer";
import { createSSRApp, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { ViField, ViPopup } from "../src";

describe("ViField", () => {
    it("wires label, status, message and a11y ids", () => {
        const w = mount(ViField, {
            props: {
                label: "Email",
                required: true,
                status: "error",
                message: "Bad"
            },
            slots: {
                default: ({ id }: { id: string }) =>
                    h("input", { id, class: "vi-native" })
            }
        });
        const input = w.get("input");
        const label = w.get("label");
        expect(label.attributes("for")).toBe(input.attributes("id"));
        expect(w.get(".vi-field").attributes("data-status")).toBe("error");
        expect(w.get(".vi-field__msg").attributes("role")).toBe("alert");
        expect(w.find(".vi-field__req").exists()).toBe(true);
    });
    it("marks disabled and bare", () => {
        const w = mount(ViField, { props: { disabled: true, bare: true } });
        expect(w.get(".vi-field").attributes("data-disabled")).toBeDefined();
        expect(w.get(".vi-field").attributes("data-bare")).toBeDefined();
    });
});

describe("ViPopup", () => {
    it("toggles via trigger slot and closes on Escape", async () => {
        const w = mount(ViPopup, {
            attachTo: document.body,
            props: { mobile: false },
            slots: {
                trigger: ({ toggle }: { toggle: () => void }) =>
                    h("button", { onClick: toggle }, "open"),
                default: () => h("div", { class: "content" }, "hi")
            }
        });
        expect(document.querySelector(".content")).toBeNull();
        await w.get("button").trigger("click");
        await nextTick();
        expect(document.querySelector(".content")).not.toBeNull();
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        await nextTick();
        expect(w.emitted("close")).toBeTruthy();
        w.unmount();
    });
    it("closes on outside pointerdown", async () => {
        const w = mount(ViPopup, {
            attachTo: document.body,
            props: { modelValue: true, mobile: false },
            slots: { default: () => h("div", "x") }
        });
        await nextTick();
        document.body.dispatchEvent(
            new Event("pointerdown", { bubbles: true })
        );
        await nextTick();
        expect(w.emitted("update:modelValue")?.[0]).toEqual([false]);
        w.unmount();
    });
});

describe("SSR", () => {
    it("renders ViField and a closed ViPopup on the server", async () => {
        const app = createSSRApp({
            render: () =>
                h("div", [
                    h(
                        ViField,
                        { label: "Name" },
                        { default: () => h("input") }
                    ),
                    h(ViPopup, null, { trigger: () => h("button", "t") })
                ])
        });
        const html = await renderToString(app);
        expect(html).toContain("vi-field");
        expect(html).toContain("<button>t</button>");
    });
});
