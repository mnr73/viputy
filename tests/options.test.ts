import { describe, expect, it } from "vitest";
import {
    buildRows,
    filterGroups,
    groupState,
    normalizeOptions,
    rowDisabled,
    toggleGroupValues
} from "../src/utils/options";

const same = (a: unknown, b: unknown) => a === b;
const cities = [
    {
        label: "Tehran province",
        options: [
            { label: "Tehran", value: 1 },
            { label: "Rey", value: 2 },
            { label: "Shemiran", value: 3, disabled: true }
        ]
    },
    { label: "Fars", options: [{ label: "Shiraz", value: 4 }] },
    "Other"
];

describe("normalizeOptions", () => {
    it("handles strings, objects and groups", () => {
        const g = normalizeOptions([
            "a",
            { label: "B", value: 2 },
            { label: "G", options: ["x"] },
            "c"
        ]);
        expect(g.map((x) => x.label)).toEqual([null, "G", null]);
        expect(g[0]!.items.map((o) => o.value)).toEqual(["a", 2]);
        expect(g[2]!.items[0]!.label).toBe("c");
    });
    it("custom accessors", () => {
        const g = normalizeOptions([{ id: 7, name: "Zed", off: true }], {
            value: "id",
            label: (o) => o.name.toUpperCase(),
            disabled: "off"
        });
        expect(g[0]!.items[0]).toMatchObject({
            value: 7,
            label: "ZED",
            disabled: true
        });
    });
    it("object without a value key is its own value", () => {
        const o = { label: "A" };
        expect(normalizeOptions([o])[0]!.items[0]!.value).toBe(o);
    });
});

describe("filterGroups", () => {
    const g = normalizeOptions(cities);
    it("matches Persian-normalized text and drops empty groups", () => {
        const fa = normalizeOptions([
            {
                label: "کاربران",
                options: [
                    { label: "علي", value: 1 },
                    { label: "رضا", value: 2 }
                ]
            }
        ]);
        expect(filterGroups(fa, "علی")[0]!.items).toHaveLength(1);
        expect(filterGroups(g, "shir").map((x) => x.label)).toEqual(["Fars"]);
    });
    it("a matching group label keeps all its options", () => {
        expect(filterGroups(g, "fars")[0]!.items).toHaveLength(1);
        expect(filterGroups(g, "province")[0]!.items).toHaveLength(3);
    });
    it("empty query returns everything", () => {
        expect(filterGroups(g, "  ")).toBe(g);
    });
    it("searches descriptions", () => {
        const d = normalizeOptions([
            { label: "A", description: "fast delivery" }
        ]);
        expect(filterGroups(d, "deliv")).toHaveLength(1);
    });
});

describe("rows and group toggling", () => {
    const groups = normalizeOptions(cities);
    it("flattens with group headers only for labelled groups", () => {
        const rows = buildRows(groups);
        expect(rows.map((r) => r.kind)).toEqual([
            "group",
            "option",
            "option",
            "option",
            "group",
            "option",
            "option"
        ]);
    });
    it("group state ignores disabled options", () => {
        const sel = new Set([1]);
        const g = groups[0]!;
        expect(groupState(g, (o) => sel.has(o.value as number))).toBe("some");
        sel.add(2);
        expect(groupState(g, (o) => sel.has(o.value as number))).toBe("all");
        expect(groupState(g, () => false)).toBe("none");
    });
    it("clicking a group selects all enabled, a second click clears them", () => {
        const g = groups[0]!;
        let cur: unknown[] = [1];
        const isSel = (o: { value: unknown }) => cur.includes(o.value);
        cur = toggleGroupValues(cur, g, isSel as any, (o) => o.value, same);
        expect(cur).toEqual([1, 2]);
        cur = toggleGroupValues(cur, g, isSel as any, (o) => o.value, same);
        expect(cur).toEqual([]);
    });
    it("group toggle keeps other selections", () => {
        const g = groups[0]!;
        let cur: unknown[] = [4];
        const isSel = (o: { value: unknown }) => cur.includes(o.value);
        cur = toggleGroupValues(cur, g, isSel as any, (o) => o.value, same);
        expect(cur).toEqual([4, 1, 2]);
    });
    it("group headers are inert in single mode", () => {
        const rows = buildRows(groups);
        expect(rowDisabled(rows[0]!, false, () => false)).toBe(true);
        expect(rowDisabled(rows[0]!, true, () => false)).toBe(false);
        expect(rowDisabled(rows[3]!, true, () => false)).toBe(true);
    });
});
