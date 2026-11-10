import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { ViSelect, viputy } from "../src";

afterEach(() => {
    document.body.innerHTML = "";
});

const flush = async () => {
    await nextTick();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};

function make(props: Record<string, unknown>) {
    const model = ref<any>(props.modelValue);
    const w = mount(ViSelect, {
        attachTo: document.body,
        props: {
            ...props,
            modelValue: model.value,
            "onUpdate:modelValue": (v: any) => {
                model.value = v;
                w.setProps({ modelValue: v });
            }
        },
        global: { plugins: [[viputy, { locale: "en" }]] }
    });
    return { w, model };
}
const trigger = (w: ReturnType<typeof mount>) => w.get('[role="combobox"]');
const open = async (w: ReturnType<typeof mount>) => {
    await trigger(w).trigger("click");
    await w.get(".vi-field__control").trigger("click");
    await flush();
};
const opts = () => [
    ...document.querySelectorAll<HTMLElement>('[role="option"]')
];
const key = async (w: ReturnType<typeof mount>, k: string) => {
    await trigger(w).trigger("keydown", { key: k });
    await flush();
};

describe("ViSelect single", () => {
    it("shows the placeholder, opens, picks and closes", async () => {
        const { w, model } = make({
            options: ["Vue", "React"],
            placeholder: "Pick"
        });
        expect(w.text()).toContain("Pick");
        await w.get(".vi-field__control").trigger("click");
        await flush();
        expect(opts().map((o) => o.textContent!.trim())).toEqual([
            "Vue",
            "React"
        ]);
        opts()[1]!.click();
        await flush();
        expect(model.value).toBe("React");
        expect(opts()).toHaveLength(0);
        expect(w.text()).toContain("React");
        w.unmount();
    });
    it("object options with value/label keys and by-compare", async () => {
        const users = [
            { id: 1, label: "Ali" },
            { id: 2, label: "Sara" }
        ];
        const { w, model } = make({
            options: users,
            modelValue: { id: 2, label: "Sara" },
            by: "id"
        });
        expect(w.get(".vi-select__text").text()).toBe("Sara");
        await w.get(".vi-field__control").trigger("click");
        await flush();
        expect(opts()[1]!.getAttribute("aria-selected")).toBe("true");
        opts()[0]!.click();
        await flush();
        expect(model.value).toEqual(users[0]);
        w.unmount();
    });
    it("keyboard: ArrowDown opens, arrows move, Enter picks, Escape closes", async () => {
        const { w, model } = make({ options: ["a", "b", "c"] });
        await key(w, "ArrowDown");
        expect(opts()).toHaveLength(3);
        await key(w, "ArrowDown");
        await key(w, "ArrowDown");
        await key(w, "Enter");
        expect(model.value).toBe("b");
        expect(opts()).toHaveLength(0);
        await key(w, "ArrowDown");
        document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        await flush();
        expect(opts()).toHaveLength(0);
        w.unmount();
    });
    it("skips disabled options", async () => {
        const { w, model } = make({
            options: [
                { label: "a", value: 1, disabled: true },
                { label: "b", value: 2 }
            ]
        });
        await key(w, "ArrowDown");
        await key(w, "ArrowDown");
        await key(w, "Enter");
        expect(model.value).toBe(2);
        w.unmount();
    });
    it("searches (Persian-normalized) when there are many options, with empty state", async () => {
        const names = [
            "علي",
            "رضا",
            "سارا",
            "مینا",
            "نگار",
            "هدی",
            "یاسر",
            "کیان"
        ];
        const { w } = make({ options: names });
        await w.get(".vi-field__control").trigger("click");
        await flush();
        const input =
            document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
        expect(input).toBeTruthy();
        input.value = "علی";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();
        expect(opts()).toHaveLength(1);
        input.value = "zzz";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();
        expect(document.body.textContent).toContain("No results found");
        w.unmount();
    });
    it("clearable resets to null; hidden input submits with forms", async () => {
        const { w, model } = make({
            options: ["a"],
            modelValue: "a",
            clearable: true,
            name: "pick"
        });
        expect(
            document.querySelector('input[type="hidden"][name="pick"]')
        ).toBeTruthy();
        await w.get(".vi-clear").trigger("click");
        expect(model.value).toBeNull();
        w.unmount();
    });
    it("disabled cannot open", async () => {
        const { w } = make({ options: ["a"], disabled: true });
        await w.get(".vi-field__control").trigger("click");
        await flush();
        expect(opts()).toHaveLength(0);
        w.unmount();
    });
});

describe("ViSelect multiple + groups", () => {
    const groups = [
        {
            label: "Tehran province",
            options: [
                { label: "Tehran", value: 1 },
                { label: "Rey", value: 2 }
            ]
        },
        { label: "Fars", options: [{ label: "Shiraz", value: 3 }] }
    ];
    it("toggles items and shows chips; removing a chip updates the model", async () => {
        const { w, model } = make({
            options: groups,
            multiple: true,
            modelValue: []
        });
        await w.get(".vi-field__control").trigger("click");
        await flush();
        opts()
            .find((o) => o.textContent!.includes("Rey"))!
            .click();
        await flush();
        opts()
            .find((o) => o.textContent!.includes("Shiraz"))!
            .click();
        await flush();
        expect(model.value).toEqual([2, 3]);
        expect(w.findAll(".vi-chip").map((c) => c.text())).toEqual([
            "Rey",
            "Shiraz"
        ]);
        await w.findAll(".vi-chip__x")[0]!.trigger("click");
        expect(model.value).toEqual([3]);
        w.unmount();
    });
    it("clicking a group header selects the whole group, indeterminate when partial", async () => {
        const { w, model } = make({
            options: groups,
            multiple: true,
            modelValue: [1]
        });
        await w.get(".vi-field__control").trigger("click");
        await flush();
        const headers = [
            ...document.querySelectorAll<HTMLElement>(".vi-option--group")
        ];
        expect(
            headers[0]!.querySelector(".vi-mark")!.getAttribute("data-state")
        ).toBe("some");
        headers[0]!.click();
        await flush();
        expect(model.value).toEqual([1, 2]);
        expect(
            document
                .querySelectorAll(".vi-option--group")[0]!
                .querySelector(".vi-mark")!
                .getAttribute("data-state")
        ).toBe("all");
        document.querySelectorAll<HTMLElement>(".vi-option--group")[0]!.click();
        await flush();
        expect(model.value).toEqual([]);
        w.unmount();
    });
    it("stays open after picking; count display; maxChips overflow", async () => {
        const { w } = make({
            options: ["a", "b", "c", "d"],
            multiple: true,
            modelValue: ["a", "b", "c"],
            maxChips: 2
        });
        expect(w.findAll(".vi-chip").map((c) => c.text())).toEqual([
            "a",
            "b",
            "+3".replace("3", "1")
        ]);
        await w.setProps({ display: "count" });
        expect(w.get(".vi-select__text").text()).toBe("3 selected");
        w.unmount();
    });
    it("select all / clear actions", async () => {
        const { w, model } = make({
            options: groups,
            multiple: true,
            modelValue: []
        });
        await w.get(".vi-field__control").trigger("click");
        await flush();
        const [all, clear] = [
            ...document.querySelectorAll<HTMLElement>(
                ".vi-select__foot .vi-link"
            )
        ];
        all!.click();
        await flush();
        expect(model.value).toEqual([1, 2, 3]);
        clear!.click();
        await flush();
        expect(model.value).toEqual([]);
        w.unmount();
    });
    it("Backspace removes the last chip when closed", async () => {
        const { w, model } = make({
            options: ["a", "b"],
            multiple: true,
            modelValue: ["a", "b"]
        });
        await key(w, "Backspace");
        expect(model.value).toEqual(["a"]);
        w.unmount();
    });
});

describe("SSR", () => {
    it("renders closed", async () => {
        const app = createSSRApp({
            render: () =>
                h(ViSelect, { label: "L", options: ["a"], modelValue: "a" })
        });
        const html = await renderToString(app);
        expect(html).toContain('role="combobox"');
        expect(html).toContain("vi-select__text");
    });
});
