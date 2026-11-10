import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import {
    ViCheckbox,
    ViInput,
    ViRadioGroup,
    ViSwitch,
    ViTag,
    ViText
} from "../src";
import { viputy } from "../src";

const type = async (w: ReturnType<typeof mount>, value: string) => {
    const el = w.get("input").element as HTMLInputElement;
    el.value = value;
    await w.get("input").trigger("input");
};

describe("ViInput", () => {
    it("binds text and fixes Arabic letters", async () => {
        const w = mount(ViInput, { props: { label: "Name" } });
        await type(w, "كيان");
        expect(w.emitted("update:modelValue")![0]).toEqual(["کیان"]);
        expect(w.get("label").attributes("for")).toBe(
            w.get("input").attributes("id")
        );
    });
    it("number: emits a real number and formats the display", async () => {
        const w = mount(ViInput, {
            props: {
                type: "number",
                grouped: true,
                persianDigits: true,
                modelValue: null
            }
        });
        await type(w, "۲۴۵۰۰۰۰");
        expect(w.emitted("update:modelValue")![0]).toEqual([2450000]);
        expect((w.get("input").element as HTMLInputElement).value).toBe(
            "۲٬۴۵۰٬۰۰۰"
        );
        expect(w.get("input").attributes("dir")).toBe("ltr");
    });
    it("number: clamps min/max on blur and rejects letters", async () => {
        const w = mount(ViInput, {
            props: { type: "number", min: 0, max: 100 }
        });
        await type(w, "abc250");
        await w.get("input").trigger("blur");
        const last = w.emitted("update:modelValue")!.at(-1);
        expect(last).toEqual([100]);
    });
    it("number: min >= 0 forbids a minus sign", async () => {
        const w = mount(ViInput, { props: { type: "number", min: 0 } });
        await type(w, "-5");
        expect(w.emitted("update:modelValue")![0]).toEqual([5]);
    });
    it("number: external modelValue updates the text", async () => {
        const w = mount(ViInput, {
            props: { type: "number", grouped: true, modelValue: 1000 }
        });
        expect((w.get("input").element as HTMLInputElement).value).toBe(
            "1,000"
        );
        await w.setProps({ modelValue: 25000 });
        expect((w.get("input").element as HTMLInputElement).value).toBe(
            "25,000"
        );
    });
    it("clearable shows a clear button that empties the value", async () => {
        const w = mount(ViInput, {
            props: { clearable: true, modelValue: "abc" }
        });
        await w.get(".vi-clear").trigger("click");
        expect(w.emitted("update:modelValue")!.at(-1)).toEqual([""]);
    });
    it("password reveal toggles the type", async () => {
        const w = mount(ViInput, { props: { type: "password" } });
        expect(w.get("input").attributes("type")).toBe("password");
        await w.get(".vi-icon-btn").trigger("click");
        expect(w.get("input").attributes("type")).toBe("text");
    });
    it("passes class to the root and other attrs to the input", () => {
        const w = mount(ViInput, {
            attrs: { class: "mine", name: "email", autocomplete: "off" }
        });
        expect(w.get(".vi-field").classes()).toContain("mine");
        expect(w.get("input").attributes("name")).toBe("email");
    });
    it("prefix/suffix render", () => {
        const w = mount(ViInput, { props: { prefix: "$", suffix: "IRR" } });
        expect(w.findAll(".vi-affix").map((e) => e.text())).toEqual([
            "$",
            "IRR"
        ]);
    });
});

describe("ViText", () => {
    it("counter, warning and over-limit error", async () => {
        const w = mount(ViText, {
            props: { maxlength: 10, modelValue: "123456789" },
            global: { plugins: [[viputy, { locale: "fa" }]] }
        });
        expect(w.get(".vi-counter").text()).toBe("۹ / ۱۰");
        expect(w.get(".vi-counter").attributes("data-state")).toBe("warning");
        await w.setProps({ modelValue: "12345678901234" });
        expect(w.get(".vi-field").attributes("data-status")).toBe("error");
        expect(w.get(".vi-field__msg").text()).toContain("۴");
    });
    it("emits on input", async () => {
        const w = mount(ViText);
        const el = w.get("textarea").element as HTMLTextAreaElement;
        el.value = "hello";
        await w.get("textarea").trigger("input");
        expect(w.emitted("update:modelValue")![0]).toEqual(["hello"]);
    });
});

describe("ViCheckbox / ViSwitch / ViRadioGroup", () => {
    it("array model", async () => {
        const model = ref<string[]>([]);
        const w = mount({
            render: () =>
                h("div", [
                    h(ViCheckbox, {
                        value: "a",
                        label: "A",
                        modelValue: model.value,
                        "onUpdate:modelValue": (v: string[]) =>
                            (model.value = v)
                    }),
                    h(ViCheckbox, {
                        value: "b",
                        label: "B",
                        modelValue: model.value,
                        "onUpdate:modelValue": (v: string[]) =>
                            (model.value = v)
                    })
                ])
        });
        const boxes = w.findAll("input");
        await boxes[1]!.setValue(true);
        await boxes[0]!.setValue(true);
        expect(model.value).toEqual(["b", "a"]);
    });
    it("indeterminate is set on the native input", async () => {
        const w = mount(ViCheckbox, {
            props: { indeterminate: true, modelValue: false },
            attachTo: document.body
        });
        await nextTick();
        expect((w.get("input").element as HTMLInputElement).indeterminate).toBe(
            true
        );
        w.unmount();
    });
    it("switch has role=switch and toggles", async () => {
        const w = mount(ViSwitch, {
            props: { label: "On", modelValue: false }
        });
        expect(w.get("input").attributes("role")).toBe("switch");
        await w.get("input").setValue(true);
        expect(w.emitted("update:modelValue")![0]).toEqual([true]);
    });
    it("radio group selects and shares a name", async () => {
        const w = mount(ViRadioGroup, {
            props: {
                label: "Ship",
                modelValue: "a",
                options: [
                    { value: "a", label: "A" },
                    { value: "b", label: "B" }
                ]
            }
        });
        const radios = w.findAll("input");
        expect(radios[0]!.attributes("name")).toBe(
            radios[1]!.attributes("name")
        );
        expect((radios[0]!.element as HTMLInputElement).checked).toBe(true);
        await radios[1]!.setValue(true);
        expect(w.emitted("update:modelValue")![0]).toEqual(["b"]);
    });
    it("card mode adds the card class", () => {
        const w = mount(ViRadioGroup, {
            props: { card: true, options: [{ value: 1, label: "x" }] }
        });
        expect(w.find(".vi-radio--card").exists()).toBe(true);
    });
});

describe("ViTag", () => {
    const make = (props: Record<string, unknown> = {}) => {
        const model = ref<string[]>((props.modelValue as string[]) ?? []);
        const w = mount(ViTag, {
            attachTo: document.body,
            props: {
                ...props,
                modelValue: model.value,
                "onUpdate:modelValue": (v: string[]) => {
                    model.value = v;
                    w.setProps({ modelValue: v });
                }
            }
        });
        return { w, model };
    };
    const key = async (w: ReturnType<typeof mount>, k: string) => {
        await w.get("input").trigger("keydown", { key: k });
    };
    const typeTag = async (w: ReturnType<typeof mount>, v: string) => {
        const el = w.get("input").element as HTMLInputElement;
        el.value = v;
        await w.get("input").trigger("input");
    };

    it("adds with Enter and a separator, removes with Backspace", async () => {
        const { w, model } = make();
        await typeTag(w, "vue");
        await key(w, "Enter");
        await typeTag(w, "css");
        await key(w, ",");
        expect(model.value).toEqual(["vue", "css"]);
        await key(w, "Backspace");
        expect(model.value).toEqual(["vue"]);
        w.unmount();
    });
    it("blocks duplicates (Persian-normalized) and respects max", async () => {
        const { w, model } = make({ max: 2, modelValue: ["علي"] });
        await typeTag(w, "علی");
        await key(w, "Enter");
        expect(model.value).toEqual(["علي"]);
        await typeTag(w, "b");
        await key(w, "Enter");
        expect(model.value).toHaveLength(2);
        await typeTag(w, "c");
        await key(w, "Enter");
        expect(model.value).toHaveLength(2);
        expect(w.find(".vi-field__msg").exists()).toBe(true);
        w.unmount();
    });
    it("allowCustom=false only accepts suggestions via the list", async () => {
        const { w, model } = make({
            allowCustom: false,
            suggestions: ["Vue", "React"]
        });
        await typeTag(w, "zzz");
        await key(w, "Enter");
        expect(model.value).toEqual([]);
        w.unmount();
    });
    it("pasting a separated list adds all", async () => {
        const { w, model } = make();
        await w.get("input").trigger("paste", {
            clipboardData: { getData: () => "a, b،c\nd" }
        });
        expect(model.value).toEqual(["a", "b", "c", "d"]);
        w.unmount();
    });
    it("remove button removes a chip", async () => {
        const { w, model } = make({ modelValue: ["x", "y"] });
        await w.findAll(".vi-chip__x")[0]!.trigger("click");
        expect(model.value).toEqual(["y"]);
        w.unmount();
    });
    it("hideTags shows only a count", () => {
        const { w } = make({ hideTags: true, modelValue: ["a", "b", "c"] });
        expect(w.findAll(".vi-chip__x")).toHaveLength(0);
        expect(w.get(".vi-chip--count").text()).toContain("3");
        w.unmount();
    });
});

describe("SSR", () => {
    it("renders every input on the server", async () => {
        const app = createSSRApp({
            render: () =>
                h("div", [
                    h(ViInput, {
                        label: "a",
                        type: "number",
                        modelValue: 1234,
                        grouped: true
                    }),
                    h(ViText, { label: "b", maxlength: 5 }),
                    h(ViCheckbox, { label: "c" }),
                    h(ViSwitch, { label: "d" }),
                    h(ViRadioGroup, { options: [{ value: 1, label: "e" }] }),
                    h(ViTag, { label: "f", modelValue: ["x"] })
                ])
        });
        const html = await renderToString(app);
        expect(html).toContain('value="1,234"');
        expect(html).toContain("vi-chip");
        expect(html).toContain('role="switch"');
    });
});

describe("loading state", () => {
    it("checkbox, switch and radio block changes while loading", async () => {
        const w = mount(ViCheckbox, { props: { loading: true } });
        expect(w.find("input").element.disabled).toBe(true);
        expect(w.find("label").attributes("data-loading")).toBeDefined();
        expect(w.find("input").attributes("aria-busy")).toBe("true");
        const s = mount(ViSwitch, { props: { loading: true } });
        expect(s.find("input").element.disabled).toBe(true);
        const g = mount(ViRadioGroup, {
            props: { loading: true, options: [{ value: 1, label: "a" }] }
        });
        expect(g.find("input").element.disabled).toBe(true);
        expect(g.find(".vi-radio").attributes("data-loading")).toBeDefined();
    });
});

describe("ViTag hide-tags", () => {
    it("count chip opens a list where items can be removed", async () => {
        const w = mount(ViTag, {
            attachTo: document.body,
            props: {
                modelValue: ["a", "b"],
                hideTags: true,
                "onUpdate:modelValue": (v: string[]) =>
                    w.setProps({ modelValue: v })
            }
        });
        await w.find(".vi-chip--button").trigger("click");
        await nextTick();
        const rows = document.querySelectorAll(".vi-taglist .vi-option");
        expect(rows.length).toBe(2);
        (rows[0]!.querySelector(".vi-chip__x") as HTMLElement).click();
        await nextTick();
        expect(w.props("modelValue")).toEqual(["b"]);
        w.unmount();
    });
});

describe("frame click focuses the field", () => {
    it("ViInput and ViText focus on a click outside the native element", async () => {
        const i = mount(ViInput, { attachTo: document.body });
        await i.find(".vi-field__control").trigger("click");
        expect(document.activeElement).toBe(i.find("input").element);
        i.unmount();
        const t = mount(ViText, { attachTo: document.body });
        await t.find(".vi-field__control").trigger("click");
        expect(document.activeElement).toBe(t.find("textarea").element);
        t.unmount();
    });
    it("does not steal a click that landed on a button", async () => {
        const i = mount(ViInput, {
            attachTo: document.body,
            props: { modelValue: "abc", type: "password" }
        });
        (document.activeElement as HTMLElement | null)?.blur();
        const btn = i.find(".vi-field__control button");
        expect(btn.exists()).toBe(true);
        await btn.trigger("click");
        expect(document.activeElement).not.toBe(i.find("input").element);
        i.unmount();
    });
});
