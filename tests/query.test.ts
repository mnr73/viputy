import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import {
    ViQueryBuilder,
    allowedOps,
    fromQueryString,
    toQueryString,
    validateItem,
    viputy,
    type QueryField,
    type QueryItem
} from "../src";

const fields: QueryField[] = [
    {
        key: "user",
        label: "User",
        type: "entity",
        options: [
            { key: 42, label: "Milad" },
            { key: 7, label: "Mina" }
        ]
    },
    {
        key: "age",
        label: "Age",
        type: "number",
        operators: ">,=,<,between",
        multiple: true,
        min: 0
    },
    {
        key: "type",
        label: "Type",
        type: "select",
        operators: ["in", "nin"],
        options: [
            { key: 1, label: "Buy" },
            { key: 2, label: "Sell" }
        ]
    },
    {
        key: "date",
        label: "Date",
        type: "date",
        operators: [">", "<", "between"],
        variants: [
            { key: "create", label: "Created" },
            { key: "update", label: "Updated" }
        ]
    },
    { key: "note", label: "Note" },
    { key: "paid", label: "Paid", type: "boolean" }
];

describe("query helpers", () => {
    it("operators: string or array, with defaults per type", () => {
        expect(allowedOps(fields[1]!)).toEqual([">", "=", "<", "between"]);
        expect(allowedOps({ key: "x", label: "x", type: "select" })).toEqual([
            "in"
        ]);
        expect(
            allowedOps({ key: "x", label: "x", operators: "nope,=" })
        ).toEqual(["="]);
    });

    it("query string and back", () => {
        const items: QueryItem[] = [
            { key: "user", op: "=", value: 42 },
            { key: "age", op: "<", value: 30 },
            { key: "age", op: "between", value: [10, 40] },
            { key: "date", op: ">", variant: "create", value: "2026-11-01" },
            { key: "type", op: "in", value: [1, 2] },
            { key: "paid", op: "=", value: true }
        ];
        const qs = toQueryString(items);
        expect(qs).toBe(
            "filter[user]=42&filter[age][lt]=30&filter[age][between]=10,40&filter[date_create][gt]=2026-11-01&filter[type][in]=1,2&filter[paid]=1"
        );
        expect(fromQueryString("?" + qs, fields)).toEqual(items);
    });

    it("unknown fields and operators are skipped; custom param name", () => {
        expect(
            fromQueryString("filter[nope]=1&filter[age][zzz]=2&x=1", fields)
        ).toEqual([]);
        const qs = toQueryString(
            [{ key: "note", op: "contains", value: "a b&c" }],
            { param: "f" }
        );
        expect(qs).toBe("f[note][contains]=a%20b%26c");
        expect(fromQueryString(qs, fields, { param: "f" })).toEqual([
            { key: "note", op: "contains", value: "a b&c" }
        ]);
    });

    it("valueless operators serialize and parse", () => {
        const qs = toQueryString([{ key: "note", op: "empty" }]);
        expect(qs).toBe("filter[note][empty]=1");
        expect(fromQueryString(qs, fields)).toEqual([
            { key: "note", op: "empty" }
        ]);
    });

    it("validateItem", () => {
        const age = fields[1]!;
        expect(validateItem(age, { key: "age", op: "<", value: 5 })).toBeNull();
        expect(validateItem(age, { key: "age", op: "<", value: -1 })?.key).toBe(
            "outOfRange"
        );
        expect(
            validateItem(age, { key: "age", op: "<", value: "x" })?.key
        ).toBe("invalidNumber");
        expect(
            validateItem(age, { key: "age", op: "between", value: [5] })?.key
        ).toBe("required");
        expect(
            validateItem(age, { key: "age", op: "between", value: [9, 3] })?.key
        ).toBe("endBeforeStart");
        expect(validateItem(age, { key: "age", op: "<" })?.key).toBe(
            "required"
        );
        expect(
            validateItem(fields[4]!, { key: "note", op: "empty" })
        ).toBeNull();
        expect(
            validateItem(fields[3]!, {
                key: "date",
                op: ">",
                value: "2026-02-31"
            })?.key
        ).toBe("invalidDate");
        const custom: QueryField = {
            key: "a",
            label: "a",
            type: "number",
            validate: (v) => ((v as number) % 2 ? "even only" : null)
        };
        expect(
            validateItem(custom, { key: "a", op: "=", value: 3 })?.text
        ).toBe("even only");
    });
});

describe("ViQueryBuilder", () => {
    const make = (modelValue: QueryItem[] = []) => {
        const w = mount(ViQueryBuilder, {
            attachTo: document.body,
            global: { plugins: [[viputy, { locale: "en" }]] },
            props: {
                fields,
                modelValue,
                "onUpdate:modelValue": (v: QueryItem[]) =>
                    w.setProps({ modelValue: v })
            }
        });
        return w;
    };
    const press = async (w: ReturnType<typeof make>, key: string) => {
        await w.get("input").trigger("keydown", { key });
        await nextTick();
    };
    const type = async (w: ReturnType<typeof make>, v: string) => {
        const el = w.get("input").element as HTMLInputElement;
        el.value = v;
        await w.get("input").trigger("input");
        await nextTick();
    };
    const model = (w: ReturnType<typeof make>) =>
        w.props("modelValue") as QueryItem[];

    it("builds a number filter: @ field, operator, value", async () => {
        const w = make();
        await type(w, "@age");
        await press(w, "Enter");
        await press(w, "ArrowDown");
        await press(w, "Enter");
        await type(w, "30");
        await press(w, "Enter");
        expect(model(w)).toEqual([{ key: "age", op: "=", value: 30 }]);
        w.unmount();
    });

    it("rejects an invalid value and keeps the draft", async () => {
        const w = make();
        await type(w, "@age");
        await press(w, "Enter");
        await press(w, "Enter");
        await type(w, "-4");
        await press(w, "Enter");
        expect(model(w)).toEqual([]);
        expect(document.querySelector(".vi-qb__err")).not.toBeNull();
        w.unmount();
    });

    it("a used field is hidden unless `multiple`", async () => {
        const w = make([
            { key: "type", op: "in", value: [1] },
            { key: "age", op: "<", value: 30 }
        ]);
        await type(w, "@");
        const labels = [
            ...document.querySelectorAll(".vi-panel .vi-option__label")
        ].map((e) => e.textContent!.trim());
        expect(labels).not.toContain("Type");
        expect(labels).toContain("Age");
        w.unmount();
    });

    it("Backspace selects the last chip, then removes it; Escape cancels a draft", async () => {
        const w = make([
            { key: "note", op: "contains", value: "a" },
            { key: "age", op: "<", value: 3 }
        ]);
        await press(w, "Backspace");
        expect(model(w).length).toBe(2);
        expect(w.find(".vi-qchip[data-selected]").exists()).toBe(true);
        await press(w, "Backspace");
        expect(model(w).map((i) => i.key)).toEqual(["note"]);
        await type(w, "@note");
        await press(w, "Enter");
        await press(w, "Escape");
        expect(w.find("[data-draft]").exists()).toBe(false);
        expect(model(w).length).toBe(1);
        w.unmount();
    });

    it("an item whose field is unknown or invalid shows as invalid", async () => {
        const w = make([
            { key: "age", op: "<", value: -5 },
            { key: "gone", op: "=", value: 1 }
        ]);
        expect(w.findAll(".vi-qchip[data-invalid]").length).toBe(2);
        w.unmount();
    });

    it("multi select commits once with the chosen values", async () => {
        const w = make();
        await type(w, "@type");
        await press(w, "Enter"); // field -> operator step (in / nin)
        await press(w, "Enter"); // "in" -> values
        await press(w, "ArrowDown"); // list starts with no active row
        await press(w, "Enter"); // toggle Buy
        await press(w, "ArrowDown");
        await press(w, "Enter"); // toggle Sell
        expect(model(w)).toEqual([]); // nothing committed while choosing
        await w
            .get("input")
            .trigger("keydown", { key: "Enter", ctrlKey: true });
        await nextTick();
        expect(model(w)).toEqual([{ key: "type", op: "in", value: [1, 2] }]);
        w.unmount();
    });
});
