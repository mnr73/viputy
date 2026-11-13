import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { ViColor, ViForm, ViOtp, viputy } from "../src";

afterEach(() => {
    document.body.innerHTML = "";
});
const flush = async () => {
    for (let i = 0; i < 4; i++) await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const plugins = (locale = "en") => [[viputy, { locale }]] as any;

const otp = (props: Record<string, unknown> = {}, init = "", locale = "en") => {
    const value = ref(init);
    const done = vi.fn();
    const w = mount(
        defineComponent({
            setup: () => () =>
                h(ViOtp, {
                    modelValue: value.value,
                    "onUpdate:modelValue": (v: string) => (value.value = v),
                    onComplete: done,
                    ...props
                })
        }),
        { attachTo: document.body, global: { plugins: plugins(locale) } }
    );
    const boxes = () => w.findAll("input.vi-otp__box");
    const type = async (i: number, ch: string) => {
        const el = boxes()[i]!.element as HTMLInputElement;
        el.focus();
        el.value = ch;
        await boxes()[i]!.trigger("input");
        await flush();
    };
    const key = async (i: number, k: string) => {
        await boxes()[i]!.trigger("keydown", { key: k });
        await flush();
    };
    const active = () =>
        boxes().findIndex((b) => b.element === document.activeElement);
    return { w, value, done, boxes, type, key, active };
};

describe("ViOtp", () => {
    it("renders one box per character", () => {
        const o = otp({ length: 4 });
        expect(o.boxes()).toHaveLength(4);
        const o2 = otp({ length: 8 });
        expect(o2.boxes()).toHaveLength(8);
    });
    it("typing a digit fills the box and moves to the next", async () => {
        const o = otp({ length: 4 });
        await o.type(0, "1");
        expect(o.value.value).toBe("1");
        expect(o.active()).toBe(1);
        await o.type(1, "2");
        expect(o.value.value).toBe("12");
        expect(o.active()).toBe(2);
    });
    it("number type rejects letters; alphanumeric takes them", async () => {
        const n = otp({ length: 4 });
        await n.type(0, "a");
        expect(n.value.value).toBe("");
        const a = otp({ length: 4, type: "alphanumeric" });
        await a.type(0, "a");
        expect(a.value.value).toBe("a");
    });
    it("Persian digits are stored as ASCII and shown Persian in fa", async () => {
        const o = otp({ length: 4 }, "", "fa");
        await o.type(0, "۴");
        expect(o.value.value).toBe("4");
        expect((o.boxes()[0]!.element as HTMLInputElement).value).toBe("۴");
    });
    it("Backspace clears the box; on an empty box it steps back and clears the previous", async () => {
        const o = otp({ length: 4 }, "123");
        (o.boxes()[2]!.element as HTMLElement).focus();
        await o.key(2, "Backspace");
        expect(o.value.value).toBe("12");
        expect(o.active()).toBe(2);
        await o.key(2, "Backspace"); // box 3 is empty now -> clears box 2 and goes back
        expect(o.value.value).toBe("1");
        expect(o.active()).toBe(1);
    });
    it("a paste fills every box, whatever it contains around the code", async () => {
        const o = otp({ length: 6 });
        const ev = new Event("paste", {
            bubbles: true,
            cancelable: true
        }) as any;
        ev.clipboardData = { getData: () => " ۱۲۳-۴۵۶ " };
        o.boxes()[2]!.element.dispatchEvent(ev);
        await flush();
        expect(o.value.value).toBe("123456");
        expect(o.done).toHaveBeenCalledWith("123456");
        expect(ev.defaultPrevented).toBe(true);
    });
    it("a longer paste is cut to the length", async () => {
        const o = otp({ length: 4 });
        const ev = new Event("paste", {
            bubbles: true,
            cancelable: true
        }) as any;
        ev.clipboardData = { getData: () => "98765432" };
        o.boxes()[0]!.element.dispatchEvent(ev);
        await flush();
        expect(o.value.value).toBe("9876");
    });
    it("SMS autofill (several characters into one box) fills all boxes", async () => {
        const o = otp({ length: 6 });
        await o.type(0, "482913");
        expect(o.value.value).toBe("482913");
    });
    it("`complete` fires once, when the last box is filled, and again only after it was changed", async () => {
        const o = otp({ length: 3 });
        await o.type(0, "1");
        await o.type(1, "2");
        expect(o.done).not.toHaveBeenCalled();
        await o.type(2, "3");
        expect(o.done).toHaveBeenCalledTimes(1);
        expect(o.done).toHaveBeenCalledWith("123");
        await o.key(2, "Backspace");
        await o.type(2, "3");
        expect(o.done).toHaveBeenCalledTimes(2);
    });
    it("auto-submit submits the enclosing form only when the code is complete", async () => {
        const code = ref("");
        const submit = vi.fn();
        const w = mount(
            defineComponent({
                components: { ViForm, ViOtp },
                setup: () => ({ code, submit }),
                template: `<ViForm @submit="submit"><ViOtp v-model="code" name="code" :length="4" auto-submit :rules="['required']" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugins() } }
        );
        (HTMLFormElement.prototype as any).requestSubmit ??= function (
            this: HTMLFormElement
        ) {
            this.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
            );
        };
        const boxes = () => w.findAll("input.vi-otp__box");
        for (const [i, ch] of ["1", "2", "3"].entries()) {
            (boxes()[i]!.element as HTMLInputElement).value = ch;
            await boxes()[i]!.trigger("input");
            await flush();
        }
        expect(submit).not.toHaveBeenCalled();
        (boxes()[3]!.element as HTMLInputElement).value = "4";
        await boxes()[3]!.trigger("input");
        await flush();
        await flush();
        expect(submit).toHaveBeenCalledTimes(1);
        expect(submit.mock.calls[0]![0]).toEqual({ code: "1234" });
    });
    it("without auto-submit nothing is submitted", async () => {
        const code = ref("");
        const submit = vi.fn();
        const w = mount(
            defineComponent({
                components: { ViForm, ViOtp },
                setup: () => ({ code, submit }),
                template: `<ViForm @submit="submit"><ViOtp v-model="code" name="code" :length="2" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugins() } }
        );
        const boxes = () => w.findAll("input.vi-otp__box");
        for (const [i, ch] of ["1", "2"].entries()) {
            (boxes()[i]!.element as HTMLInputElement).value = ch;
            await boxes()[i]!.trigger("input");
            await flush();
        }
        expect(code.value).toBe("12");
        expect(submit).not.toHaveBeenCalled();
    });
    it("arrow keys move between boxes, Home/End jump", async () => {
        const o = otp({ length: 4 }, "123");
        (o.boxes()[1]!.element as HTMLElement).focus();
        await o.key(1, "ArrowLeft");
        expect(o.active()).toBe(0);
        await o.key(0, "ArrowRight");
        expect(o.active()).toBe(1);
        await o.key(1, "End");
        expect(o.active()).toBe(3);
        await o.key(3, "Home");
        expect(o.active()).toBe(0);
    });
    it("tapping a box after a gap sends focus to the first empty box", async () => {
        const o = otp({ length: 5 }, "12");
        (o.boxes()[4]!.element as HTMLElement).focus();
        await flush();
        expect(o.active()).toBe(2);
    });
    it("mask shows dots; group adds a dash", () => {
        const o = otp({ length: 6, mask: true, group: 3 }, "123");
        expect(o.boxes()[0]!.attributes("type")).toBe("password");
        expect(o.w.findAll(".vi-otp__sep")).toHaveLength(1);
    });
    it("one-time-code autocomplete on the first box; accessible names per box", () => {
        const o = otp({ length: 4 });
        expect(o.boxes()[0]!.attributes("autocomplete")).toBe("one-time-code");
        expect(o.boxes()[1]!.attributes("autocomplete")).toBe("off");
        expect(o.boxes()[2]!.attributes("aria-label")).toBe("Digit 3 of 4");
    });
    it("rules: required / length show a red message after blur", async () => {
        const o = otp({
            length: 4,
            rules: ["required", { length: 4 }],
            label: "Code"
        });
        (o.boxes()[0]!.element as HTMLElement).focus();
        await o.boxes()[0]!.trigger("blur", { relatedTarget: null });
        await flush();
        expect(o.w.find(".vi-field__msg").text()).toBe(
            "This field is required"
        );
        expect(o.boxes()[0]!.attributes("aria-invalid")).toBe("true");
    });
    it("disabled / readonly block typing", async () => {
        const o = otp({ length: 4, disabled: true });
        await o.type(0, "1");
        expect(o.value.value).toBe("");
        const r = otp({ length: 4, readonly: true }, "12");
        await r.key(1, "Backspace");
        expect(r.value.value).toBe("12");
    });
});

describe("ViColor", () => {
    const color = (
        props: Record<string, unknown> = {},
        init: string | null = null
    ) => {
        const value = ref<string | null>(init);
        const w = mount(
            defineComponent({
                setup: () => () =>
                    h(ViColor, {
                        modelValue: value.value,
                        "onUpdate:modelValue": (v: string | null) =>
                            (value.value = v),
                        ...props
                    })
            }),
            { attachTo: document.body, global: { plugins: plugins() } }
        );
        const openIt = async () => {
            await w.find("input.vi-color__input").trigger("click");
            await flush();
        };
        return { w, value, openIt };
    };
    const panel = () => document.querySelector(".vi-color") as HTMLElement;
    it("shows the colour as a swatch and its hex in upper case", () => {
        const c = color({}, "#2563eb");
        expect(c.w.find(".vi-color__swatch").attributes("style")).toContain(
            "#2563eb"
        );
        expect(
            (c.w.find("input.vi-color__input").element as HTMLInputElement)
                .value
        ).toBe("#2563EB");
    });
    it("empty: crossed-out swatch", () => {
        const c = color();
        expect(
            c.w.find(".vi-color__swatch").attributes("data-empty")
        ).toBeDefined();
    });
    it("click opens the grid; picking a swatch sets a lower-case hex and marks it", async () => {
        const c = color({ swatches: ["#ef4444", "#22c55e", "#2563eb"] });
        await c.openIt();
        expect(document.querySelectorAll(".vi-color__sw")).toHaveLength(3);
        (document.querySelectorAll(".vi-color__sw")[1] as HTMLElement).click();
        await flush();
        expect(c.value.value).toBe("#22c55e");
        expect(
            document
                .querySelectorAll(".vi-color__sw")[1]!
                .getAttribute("aria-pressed")
        ).toBe("true");
    });
    it("typing a hex in the field applies it once complete; a short one is an error and keeps the old value", async () => {
        const c = color({}, "#2563eb");
        const input = c.w.find("input.vi-color__input");
        (input.element as HTMLInputElement).value = "ff0000";
        await input.trigger("input");
        await flush();
        expect(c.value.value).toBe("#ff0000");
        (input.element as HTMLInputElement).value = "#12";
        await input.trigger("input");
        await flush();
        expect(c.w.find(".vi-field__msg").text()).toBe("Not a valid color");
        await input.trigger("blur");
        await flush();
        expect(c.value.value).toBe("#ff0000");
        expect((input.element as HTMLInputElement).value).toBe("#FF0000");
    });
    it("3-digit shorthand expands on blur", async () => {
        const c = color();
        const input = c.w.find("input.vi-color__input");
        (input.element as HTMLInputElement).value = "f00";
        await input.trigger("input");
        await input.trigger("blur");
        await flush();
        expect(c.value.value).toBe("#ff0000");
    });
    it("the HEX box in the panel works and Enter closes", async () => {
        const c = color();
        await c.openIt();
        const hex = document.querySelector(
            ".vi-color__hex"
        ) as HTMLInputElement;
        hex.value = "#00ff00";
        hex.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();
        expect(c.value.value).toBe("#00ff00");
        hex.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
        );
        await flush();
        expect(panel()).toBeNull();
    });
    it("clearable empties it", async () => {
        const c = color({ clearable: true }, "#2563eb");
        await c.w.find(".vi-clear").trigger("click");
        expect(c.value.value).toBeNull();
    });
    it("alpha: slider keeps the colour and adds two hex digits; swatch pick keeps the opacity", async () => {
        const c = color(
            { alpha: true, swatches: ["#ff0000", "#00ff00"] },
            "#ff0000"
        );
        await c.openIt();
        const range = document.querySelector(
            ".vi-color__alpha input"
        ) as HTMLInputElement;
        range.value = "0.5";
        range.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();
        expect(c.value.value).toBe("#ff000080");
        (document.querySelectorAll(".vi-color__sw")[1] as HTMLElement).click();
        await flush();
        expect(c.value.value).toBe("#00ff0080");
    });
    it("without alpha the field takes 6 digits at most, like a maxlength", async () => {
        const c = color();
        const input = c.w.find("input.vi-color__input");
        (input.element as HTMLInputElement).value = "#ff000080";
        await input.trigger("input");
        await input.trigger("blur");
        await flush();
        expect(c.value.value).toBe("#ff0000");
    });
    it("rules: required shows an error after blur", async () => {
        const c = color({ rules: ["required"], label: "Brand" });
        const input = c.w.find("input.vi-color__input");
        await input.trigger("blur");
        await flush();
        expect(c.w.find(".vi-field__msg").text()).toBe(
            "This field is required"
        );
    });
    it("arrow keys move over the swatch grid by one and by a row", async () => {
        const c = color({}, null);
        await c.openIt();
        await nextTick();
        const sws = [
            ...document.querySelectorAll<HTMLElement>(".vi-color__sw")
        ];
        sws[0]!.focus();
        const press = (k: string) =>
            sws
                .find((s) => s === document.activeElement)!
                .dispatchEvent(
                    new KeyboardEvent("keydown", { key: k, bubbles: true })
                );
        press("ArrowRight");
        expect(document.activeElement).toBe(sws[1]);
        press("ArrowDown");
        expect(document.activeElement).toBe(sws[9]);
        press("End");
        expect(document.activeElement).toBe(sws[sws.length - 1]);
    });
    it("hidden input carries the value for a plain form", () => {
        const c = color({ name: "brand" }, "#2563eb");
        expect(
            (c.w.find('input[type="hidden"]').element as HTMLInputElement).value
        ).toBe("#2563eb");
    });
});
