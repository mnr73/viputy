import { normalizeText } from "./text";

export type Accessor = string | ((option: any) => any);

export interface OptionAccessors {
    /** Key or function giving the visible text. Default `"label"`. */
    label?: Accessor;
    /** Key or function giving the value. Default `"value"`. */
    value?: Accessor;
    /** Default `"disabled"`. */
    disabled?: Accessor;
    /** Optional second line. Default `"description"`. */
    description?: Accessor;
    /** Key holding the children of a group. Default `"options"`. */
    group?: string;
}

export interface Opt {
    raw: unknown;
    value: unknown;
    label: string;
    description?: string;
    disabled: boolean;
}

export interface Grp {
    raw?: unknown;
    /** `null` for options that are not inside a group. */
    label: string | null;
    disabled: boolean;
    items: Opt[];
}

export type Row =
    | { kind: "group"; group: Grp; key: string }
    | { kind: "option"; option: Opt; group: Grp; key: string };

export type GroupState = "all" | "some" | "none";

const isObj = (o: unknown): o is Record<string, any> =>
    typeof o === "object" && o !== null;

function read(o: unknown, acc: Accessor | undefined, fallbackKey: string): any {
    if (!isObj(o)) return undefined;
    if (typeof acc === "function") return acc(o);
    return o[acc ?? fallbackKey];
}

export function normalizeOption(raw: unknown, acc: OptionAccessors = {}): Opt {
    if (!isObj(raw))
        return { raw, value: raw, label: String(raw ?? ""), disabled: false };
    const desc = read(raw, acc.description, "description");
    const value = read(raw, acc.value, "value");
    return {
        raw,
        value: value === undefined ? raw : value,
        label: String(read(raw, acc.label, "label") ?? ""),
        description: desc == null ? undefined : String(desc),
        disabled: !!read(raw, acc.disabled, "disabled")
    };
}

/**
 * Plain options and `{ label, options: [...] }` groups -> groups.
 * Consecutive ungrouped options share one group with a `null` label.
 */
export function normalizeOptions(
    options: unknown[] = [],
    acc: OptionAccessors = {}
): Grp[] {
    const key = acc.group ?? "options";
    const out: Grp[] = [];
    for (const raw of options) {
        if (isObj(raw) && Array.isArray(raw[key])) {
            out.push({
                raw,
                label: String(read(raw, acc.label, "label") ?? ""),
                disabled: !!read(raw, acc.disabled, "disabled"),
                items: (raw[key] as unknown[]).map((o) =>
                    normalizeOption(o, acc)
                )
            });
        } else {
            let last = out[out.length - 1];
            if (!last || last.label !== null) {
                last = { label: null, disabled: false, items: [] };
                out.push(last);
            }
            last.items.push(normalizeOption(raw, acc));
        }
    }
    return out;
}

export type FilterFn = (option: Opt, query: string) => boolean;

export const defaultFilter: FilterFn = (o, query) => {
    const q = normalizeText(query);
    return (
        normalizeText(o.label).includes(q) ||
        (!!o.description && normalizeText(o.description).includes(q))
    );
};

/** Keeps matching options. A group whose own label matches keeps all its options. */
export function filterGroups(
    groups: Grp[],
    query: string,
    fn: FilterFn = defaultFilter
): Grp[] {
    if (!query.trim()) return groups;
    const q = normalizeText(query);
    const out: Grp[] = [];
    for (const g of groups) {
        const whole = g.label !== null && normalizeText(g.label).includes(q);
        const items = whole ? g.items : g.items.filter((o) => fn(o, query));
        if (items.length) out.push({ ...g, items });
    }
    return out;
}

export function buildRows(groups: Grp[]): Row[] {
    const rows: Row[] = [];
    groups.forEach((group, gi) => {
        if (group.label !== null)
            rows.push({ kind: "group", group, key: `g${gi}` });
        group.items.forEach((option, oi) =>
            rows.push({ kind: "option", option, group, key: `o${gi}-${oi}` })
        );
    });
    return rows;
}

export function groupState(
    group: Grp,
    isSelected: (o: Opt) => boolean
): GroupState {
    const items = group.items.filter((o) => !o.disabled);
    if (!items.length || group.disabled) return "none";
    const n = items.filter(isSelected).length;
    return n === 0 ? "none" : n === items.length ? "all" : "some";
}

/** Rows the keyboard/mouse cannot act on. */
export function rowDisabled(
    row: Row,
    multiple: boolean,
    isSelected: (o: Opt) => boolean
): boolean {
    if (row.kind === "option") return row.option.disabled || row.group.disabled;
    if (!multiple || row.group.disabled) return true;
    return !row.group.items.some((o) => !o.disabled);
}

/** Enabled options a group click would add (all) or remove (when all are already selected). */
export function toggleGroupValues(
    current: unknown[],
    group: Grp,
    isSelected: (o: Opt) => boolean,
    toValue: (o: Opt) => unknown,
    same: (a: unknown, b: unknown) => boolean
): unknown[] {
    const items = group.items.filter((o) => !o.disabled);
    if (groupState(group, isSelected) === "all") {
        return current.filter((c) => !items.some((o) => same(c, toValue(o))));
    }
    const add = items.filter((o) => !isSelected(o)).map(toValue);
    return [...current, ...add];
}
