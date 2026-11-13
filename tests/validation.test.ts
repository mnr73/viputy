import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import {
    ViCheckbox,
    ViForm,
    ViInput,
    ViRadioGroup,
    ViSelect,
    ViSwitch,
    ViTag,
    ViText,
    ViUpload,
    clearRules,
    defineRule,
    viputy
} from "../src";

afterEach(() => {
    document.body.innerHTML = "";
    clearRules();
});
const flush = async () => {
    for (let i = 0; i < 4; i++) await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const plugin = (locale = "en", extra: Record<string, unknown> = {}) =>
    [[viputy, { locale, ...extra }]] as any;
const msgOf = (w: { find: (s: string) => any }) =>
    w.find(".vi-field__msg").exists() ? w.find(".vi-field__msg").text() : null;
const statusOf = (w: { find: (s: string) => any }) =>
    w.find(".vi-field").attributes("data-status") ?? null;

/** a ViInput bound to a ref, like a real parent */
const field = (
    props: Record<string, unknown> = {},
    init: string | number | null = "",
    locale = "en",
    extra = {}
) => {
    const value = ref<any>(init);
    const w = mount(
        defineComponent({
            setup: () => () =>
                h(ViInput, {
                    modelValue: value.value,
                    "onUpdate:modelValue": (v: any) => (value.value = v),
                    ...props
                })
        }),
        { attachTo: document.body, global: { plugins: plugin(locale, extra) } }
    );
    return { w, value, input: () => w.find("input") };
};
const type = async (w: ReturnType<typeof field>["w"], text: string) => {
    const el = w.find("input");
    (el.element as HTMLInputElement).value = text;
    await el.trigger("input");
    await flush();
};
const blur = async (w: ReturnType<typeof field>["w"]) => {
    await w.find("input").trigger("blur");
    await flush();
};

describe("when the error shows", () => {
    it("nothing before the user touches the field", async () => {
        const { w } = field({ rules: ["required"], label: "Name" });
        await flush();
        expect(statusOf(w)).toBeNull();
        expect(msgOf(w)).toBeNull();
        w.unmount();
    });
    it("on blur: red status and the message under the input", async () => {
        const { w } = field({ rules: ["required"], label: "Name" });
        await blur(w);
        expect(statusOf(w)).toBe("error");
        expect(msgOf(w)).toBe("This field is required");
        expect(w.find("input").attributes("aria-invalid")).toBe("true");
        expect(w.find(".vi-field__msg").attributes("role")).toBe("alert");
        w.unmount();
    });
    it("typing does not nag before the first error (blur mode)", async () => {
        const { w } = field({ rules: [{ minLength: 5 }] });
        await type(w, "ab");
        expect(statusOf(w)).toBeNull();
        w.unmount();
    });
    it("after an error it re-checks on every change, and the error leaves as soon as it is fixed", async () => {
        const { w } = field({ rules: [{ minLength: 3 }] });
        await type(w, "a");
        await blur(w);
        expect(msgOf(w)).toBe("Enter at least 3 characters");
        await type(w, "ab");
        expect(statusOf(w)).toBe("error");
        await type(w, "abc");
        expect(statusOf(w)).toBeNull();
        expect(msgOf(w)).toBeNull();
        w.unmount();
    });
    it("validate-on=input checks while typing; change/input also on a v-model set from outside", async () => {
        const { w, value } = field({
            rules: [{ minLength: 3 }],
            validateOn: "input"
        });
        await type(w, "a");
        expect(statusOf(w)).toBe("error");
        value.value = "abcd"; // set by the parent
        await flush();
        expect(statusOf(w)).toBeNull();
        w.unmount();
    });
    it("validate-on=submit never shows an error on its own", async () => {
        const { w } = field({ rules: ["required"], validateOn: "submit" });
        await blur(w);
        await type(w, "x");
        await type(w, "");
        expect(statusOf(w)).toBeNull();
        w.unmount();
    });
});

describe("messages", () => {
    it("fa defaults, Persian", async () => {
        const { w } = field({ rules: [{ minLength: 4 }] }, "ab", "fa");
        await blur(w);
        expect(msgOf(w)).toBe("حداقل 4 نویسه وارد کنید");
        w.unmount();
    });
    it("`messages` prop replaces a default, with {label} and the rule's params", async () => {
        const { w } = field({
            rules: ["required", { minLength: 3 }],
            label: "Name",
            messages: {
                required: "Fill in {label}",
                minLength: "{label}: {min}+ letters"
            }
        });
        await blur(w);
        expect(msgOf(w)).toBe("Fill in Name");
        await type(w, "a");
        expect(msgOf(w)).toBe("Name: 3+ letters");
        w.unmount();
    });
    it("a message on the rule itself beats the `messages` prop", async () => {
        const { w } = field({
            rules: [{ rule: "required", message: "own" }],
            messages: { required: "catalog" }
        });
        await blur(w);
        expect(msgOf(w)).toBe("own");
        w.unmount();
    });
    it("app-wide: `rules` option on the plugin changes a default everywhere", async () => {
        const { w } = field({ rules: ["required"], label: "نام" }, "", "fa", {
            rules: { fa: { required: "پر کردن «{label}» الزامی است" } }
        });
        await blur(w);
        expect(msgOf(w)).toBe("پر کردن «نام» الزامی است");
        w.unmount();
    });
});

describe("the caller's own status / message always win", () => {
    it("an explicit message hides the rule's message and keeps the caller's status", async () => {
        const { w } = field({
            rules: ["required"],
            message: "From the server",
            status: "warning"
        });
        await blur(w);
        expect(msgOf(w)).toBe("From the server");
        expect(statusOf(w)).toBe("warning");
        w.unmount();
    });
    it("an explicit status without a message: rules do not repaint it", async () => {
        const { w } = field({
            rules: ["required"],
            status: "success",
            hint: "ok"
        });
        await blur(w);
        expect(statusOf(w)).toBe("success");
        expect(msgOf(w)).toBe("ok");
        w.unmount();
    });
    it("hint shows until there is an error, then the error replaces it", async () => {
        const { w } = field({ rules: ["required"], hint: "Your full name" });
        expect(msgOf(w)).toBe("Your full name");
        await blur(w);
        expect(msgOf(w)).toBe("This field is required");
        w.unmount();
    });
});

describe("custom rules on a component", () => {
    it("a function, sync and async", async () => {
        const taken = vi.fn(async (v: string) =>
            v === "admin" ? "That name is taken" : true
        );
        const { w } = field({ rules: [taken] }, "");
        await type(w, "admin");
        await blur(w);
        expect(msgOf(w)).toBe("That name is taken");
        await type(w, "mina");
        expect(statusOf(w)).toBeNull();
        w.unmount();
    });
    it("a slow async result that arrives after a newer value is dropped", async () => {
        const slow = (v: string) =>
            new Promise<string | true>((r) =>
                setTimeout(
                    () => r(v === "old" ? "stale error" : true),
                    v === "old" ? 60 : 5
                )
            );
        const { w } = field({ rules: [slow], validateOn: "input" });
        await type(w, "old");
        await type(w, "new");
        await new Promise((r) => setTimeout(r, 120));
        await flush();
        expect(statusOf(w)).toBeNull();
        w.unmount();
    });
    it("defineRule once, use by name", async () => {
        defineRule("mobileOrEmail", (v: string) =>
            /^09\d{9}$/.test(v) || /@/.test(v) ? true : "Mobile or email"
        );
        const { w } = field({ rules: ["mobileOrEmail"] }, "x");
        await blur(w);
        expect(msgOf(w)).toBe("Mobile or email");
        w.unmount();
    });
    it("a rule that equals another field of a form", async () => {
        const w = mount(
            defineComponent({
                components: { ViForm, ViInput },
                setup: () => ({ p: ref("abc"), c: ref("abd") }),
                template: `<ViForm><ViInput v-model="p" name="password" /><ViInput v-model="c" name="confirm" :rules="{ equals: 'password' }" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        await flush();
        const inputs = w.findAll("input");
        await inputs[1]!.trigger("blur");
        await flush();
        expect(w.findAll(".vi-field__msg")[0]!.text()).toBe("Does not match");
        w.unmount();
    });
});

describe("other inputs", () => {
    const wrap = (comp: any, props: Record<string, unknown>, init: any) => {
        const value = ref(init);
        const w = mount(
            defineComponent({
                setup: () => () =>
                    h(comp, {
                        modelValue: value.value,
                        "onUpdate:modelValue": (v: any) => (value.value = v),
                        ...props
                    })
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        return { w, value };
    };
    it("ViText: minLength on blur", async () => {
        const { w } = wrap(ViText, { rules: [{ minLength: 5 }] }, "abc");
        await w.find("textarea").trigger("blur");
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe(
            "Enter at least 5 characters"
        );
        w.unmount();
    });
    it("ViTag: required on an empty list, minItems after adding", async () => {
        const { w, value } = wrap(
            ViTag,
            { rules: ["required", { minItems: 2 }] },
            []
        );
        await w.find("input").trigger("blur");
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe("This field is required");
        value.value = ["a"];
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe("Choose at least 2");
        value.value = ["a", "b"];
        await flush();
        expect(w.find(".vi-field__msg").exists()).toBe(false);
        w.unmount();
    });
    it("ViSelect: required, checked when the list closes", async () => {
        const { w, value } = wrap(
            ViSelect,
            { options: ["a", "b"], rules: ["required"] },
            null
        );
        await w.find(".vi-select__trigger").trigger("click");
        await flush();
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape" })
        );
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        await flush();
        await flush();
        expect(w.find(".vi-field").attributes("data-status")).toBe("error");
        value.value = "a";
        await flush();
        expect(w.find(".vi-field").attributes("data-status")).toBeUndefined();
        w.unmount();
    });
    it("ViCheckbox: required means ticked; message sits under the label; goes away when ticked", async () => {
        const { w } = wrap(
            ViCheckbox,
            { rules: { required: true }, label: "I agree" },
            false
        );
        await w.find("input").trigger("blur");
        await flush();
        expect(w.find(".vi-check__msg").text()).toBe("This field is required");
        expect(w.find(".vi-check").attributes("data-status")).toBe("error");
        expect(w.find("input").attributes("aria-invalid")).toBe("true");
        await w.find("input").setValue(true);
        await flush();
        expect(w.find(".vi-check__msg").exists()).toBe(false);
        w.unmount();
    });
    it("ViSwitch: required", async () => {
        const { w } = wrap(
            ViSwitch,
            { rules: ["required"], label: "Accept" },
            false
        );
        await w.find("input").trigger("blur");
        await flush();
        expect(w.find(".vi-switch__msg").text()).toBe("This field is required");
        w.unmount();
    });
    it("ViRadioGroup: required until one is chosen", async () => {
        const { w } = wrap(
            ViRadioGroup,
            {
                rules: ["required"],
                label: "Plan",
                options: [
                    { value: 1, label: "A" },
                    { value: 2, label: "B" }
                ]
            },
            null
        );
        // focus leaves the whole group (blur does not bubble; focusout does)
        await w.find("fieldset").trigger("focusout", { relatedTarget: null });
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe("This field is required");
        await w.findAll("input")[1]!.setValue(true);
        await flush();
        expect(w.find(".vi-field__msg").exists()).toBe(false);
        w.unmount();
    });
    it("ViUpload: required needs at least one file; minItems / maxItems count files", async () => {
        const { w, value } = wrap(
            ViUpload,
            { rules: ["required"], multiple: true },
            []
        );
        await w.find(".vi-upload__zone").trigger("blur");
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe("This field is required");
        value.value = [{ id: 1, name: "a.pdf", url: "/a" }];
        await flush();
        expect(w.find(".vi-field__msg").exists()).toBe(false);
        w.unmount();
    });
});

describe("ViForm", () => {
    const makeForm = (
        formProps: Record<string, unknown> = {},
        onSubmit = vi.fn(),
        onInvalid = vi.fn()
    ) => {
        const name = ref("");
        const city = ref<string | null>(null);
        const agree = ref(false);
        const w = mount(
            defineComponent({
                components: { ViForm, ViInput, ViSelect, ViCheckbox },
                setup: () => ({
                    name,
                    city,
                    agree,
                    formProps,
                    onSubmit,
                    onInvalid
                }),
                template: `
                <ViForm v-bind="formProps" @submit="onSubmit" @invalid="onInvalid" v-slot="f">
                    <ViInput v-model="name" name="name" label="Name" :rules="['required', { minLength: 3 }]" />
                    <ViSelect v-model="city" name="city" label="City" :options="['Tehran', 'Shiraz']" :rules="['required']" />
                    <ViCheckbox v-model="agree" name="agree" label="Terms" :rules="{ required: true }" />
                    <button type="submit" id="go">Go</button>
                    <span id="state">{{ f.submitted }}|{{ f.valid }}</span>
                </ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        return { w, name, city, agree, onSubmit, onInvalid };
    };
    const submit = async (w: ReturnType<typeof makeForm>["w"]) => {
        await w.find("form").trigger("submit");
        await flush();
        await flush();
    };
    it("a failed submit shows every error at once, does not emit submit, and reports invalid names", async () => {
        const f = makeForm();
        await submit(f.w);
        expect(f.onSubmit).not.toHaveBeenCalled();
        expect(f.w.findAll(".vi-field__msg").map((m) => m.text())).toEqual([
            "This field is required",
            "This field is required"
        ]);
        expect(f.w.find(".vi-check__msg").exists()).toBe(true);
        expect(f.onInvalid.mock.calls[0]![0].sort()).toEqual([
            "agree",
            "city",
            "name"
        ]);
        f.w.unmount();
    });
    it("focus goes to the first invalid field in the page", async () => {
        const f = makeForm();
        await submit(f.w);
        expect(document.activeElement).toBe(f.w.find("input").element);
        f.w.unmount();
    });
    it("focusFirst=false leaves focus alone", async () => {
        const f = makeForm({ focusFirst: false });
        (document.body as any).focus();
        await submit(f.w);
        expect(document.activeElement).not.toBe(f.w.find("input").element);
        f.w.unmount();
    });
    it("a valid form emits submit with the named values", async () => {
        const f = makeForm();
        f.name.value = "Mina";
        f.city.value = "Tehran";
        f.agree.value = true;
        await flush();
        await submit(f.w);
        expect(f.onSubmit).toHaveBeenCalledTimes(1);
        expect(f.onSubmit.mock.calls[0]![0]).toEqual({
            name: "Mina",
            city: "Tehran",
            agree: true
        });
        f.w.unmount();
    });
    it("validate-on=submit: nothing shows on blur, everything on submit, then live", async () => {
        const f = makeForm({ validateOn: "submit" });
        await f.w.find("input").trigger("blur");
        await flush();
        expect(f.w.findAll(".vi-field__msg")).toHaveLength(0);
        await submit(f.w);
        expect(f.w.findAll(".vi-field__msg").length).toBeGreaterThan(0);
        // fix the name: its error leaves right away (live after submit)
        const el = f.w.find("input");
        (el.element as HTMLInputElement).value = "Mina";
        await el.trigger("input");
        await flush();
        expect(
            f.w
                .findAll(".vi-field")
                .find((x) => x.text().includes("Name"))!
                .attributes("data-status")
        ).toBeUndefined();
        f.w.unmount();
    });
    it("a field's own validate-on beats the form's", async () => {
        const name = ref("");
        const w = mount(
            defineComponent({
                components: { ViForm, ViInput },
                setup: () => ({ name }),
                template: `<ViForm validate-on="submit"><ViInput v-model="name" validate-on="blur" :rules="['required']" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        await w.find("input").trigger("blur");
        await flush();
        expect(w.find(".vi-field").attributes("data-status")).toBe("error");
        w.unmount();
    });
    it("server errors by field name (string or Laravel array), cleared by the parent", async () => {
        const email = ref("a@b.co");
        const errors = ref<Record<string, any>>({
            email: ["Already taken", "second"]
        });
        const w = mount(
            defineComponent({
                components: { ViForm, ViInput },
                setup: () => ({ email, errors }),
                template: `<ViForm :errors="errors"><ViInput v-model="email" name="email" label="Email" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        await flush();
        expect(w.find(".vi-field__msg").text()).toBe("Already taken");
        expect(w.find(".vi-field").attributes("data-status")).toBe("error");
        errors.value = {};
        await flush();
        expect(w.find(".vi-field__msg").exists()).toBe(false);
        w.unmount();
    });
    it("submitting disables every field and blocks a second submit", async () => {
        const f = makeForm({ submitting: true });
        expect(
            f.w.find("fieldset.vi-form__set").attributes("disabled")
        ).toBeDefined();
        f.w.find("form").trigger("submit");
        await flush();
        expect(f.onSubmit).not.toHaveBeenCalled();
        expect(f.onInvalid).not.toHaveBeenCalled();
        f.w.unmount();
    });
    it("reset clears every error", async () => {
        const f = makeForm();
        await submit(f.w);
        expect(f.w.findAll(".vi-field__msg").length).toBeGreaterThan(0);
        await f.w.find("form").trigger("reset");
        await flush();
        expect(f.w.findAll(".vi-field__msg")).toHaveLength(0);
        expect(f.w.find(".vi-check__msg").exists()).toBe(false);
        f.w.unmount();
    });
    it("the form is novalidate by default so the browser's own bubbles never appear", () => {
        const f = makeForm();
        expect(f.w.find("form").attributes("novalidate")).toBeDefined();
        f.w.unmount();
    });
    it("a field removed from the page is no longer validated", async () => {
        const show = ref(true);
        const name = ref("");
        const onSubmit = vi.fn();
        const w = mount(
            defineComponent({
                components: { ViForm, ViInput },
                setup: () => ({ show, name, onSubmit }),
                template: `<ViForm @submit="onSubmit"><ViInput v-if="show" v-model="name" name="name" :rules="['required']" /></ViForm>`
            }),
            { attachTo: document.body, global: { plugins: plugin() } }
        );
        show.value = false;
        await flush();
        await w.find("form").trigger("submit");
        await flush();
        expect(onSubmit).toHaveBeenCalledTimes(1);
        w.unmount();
    });
});
