import { PlainDateTime } from "../date/plain";
import type { MessageKey } from "../i18n/messages";
import { normalizeOptions, type OptionAccessors } from "./options";

export type QueryType =
    "text" | "number" | "date" | "select" | "entity" | "boolean";

export type Operator =
    | "="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "in"
    | "nin"
    | "between"
    | "empty"
    | "nempty"
    | "contains"
    | "starts";

/** How many values an operator takes: none, one, exactly two, or a list. */
export type Arity = "none" | "one" | "two" | "list";

export interface QueryVariant {
    key: string;
    label: string;
}

export interface QueryField {
    key: string;
    label: string;
    /** Default `"text"`. `entity` = pick from a (searchable) list, one value by default. */
    type?: QueryType;
    /** Allowed operators, in display order. An array or `">,=,<"`. */
    operators?: Operator[] | string;
    /** Operator highlighted first. Default: the first allowed one. */
    operator?: Operator;
    /** select / entity: options (strings, `{ key|value, label }`, or groups). */
    options?: unknown[];
    /** entity: async search. Called with the typed text (debounced). */
    search?: (query: string) => Promise<unknown[]> | unknown[];
    /** Several flavours of one field (e.g. created / updated). Chip reads "label variant". */
    variants?: QueryVariant[];
    /** Allow adding the field again (e.g. age < 30 and age > 20). */
    multiple?: boolean;
    min?: number | string;
    max?: number | string;
    /** Return an error message to reject a value. */
    validate?: (
        value: unknown,
        op: Operator
    ) => string | null | undefined | void;
}

export interface QueryItem {
    key: string;
    op: Operator;
    /** Scalar, array (`in`, `nin`, `between`) or absent (`empty`, `nempty`). */
    value?: unknown;
    variant?: string;
    /** Labels shown for `search` fields (their options are not known later). Never serialized. */
    display?: string[];
}

const ARITY: Record<Operator, Arity> = {
    "=": "one",
    "!=": "one",
    "<": "one",
    "<=": "one",
    ">": "one",
    ">=": "one",
    in: "list",
    nin: "list",
    between: "two",
    empty: "none",
    nempty: "none",
    contains: "one",
    starts: "one"
};

export const opArity = (op: Operator): Arity => ARITY[op];
export const isOperator = (s: string): s is Operator => Object.hasOwn(ARITY, s);

const SYMBOL: Record<Operator, string> = {
    "=": "=",
    "!=": "≠",
    "<": "<",
    "<=": "≤",
    ">": ">",
    ">=": "≥",
    in: "=",
    nin: "≠",
    between: "↔",
    empty: "∅",
    nempty: "≠∅",
    contains: "∋",
    starts: "^"
};
export const opSymbol = (op: Operator) => SYMBOL[op];

const DEFAULT_OPS: Record<QueryType, Operator[]> = {
    text: ["contains", "=", "!=", "starts", "empty"],
    number: ["=", "<", "<=", ">", ">=", "between"],
    date: [">", "=", "<", "between", "empty"],
    select: ["in"],
    entity: ["="],
    boolean: ["="]
};

export function allowedOps(f: QueryField): Operator[] {
    const raw =
        typeof f.operators === "string"
            ? f.operators.split(",").map((s) => s.trim())
            : f.operators;
    const list = (raw ?? []).filter(isOperator);
    return list.length ? list : DEFAULT_OPS[f.type ?? "text"];
}

export function defaultOp(f: QueryField): Operator {
    const ops = allowedOps(f);
    return f.operator && ops.includes(f.operator) ? f.operator : ops[0]!;
}

/** `{ value: o.key ?? o.value }` so `{ key, label }` options (the usual API shape) just work. */
export const queryAccessors: OptionAccessors = {
    value: (o: any) => o.key ?? o.value
};

export const sameValue = (a: unknown, b: unknown) => String(a) === String(b);

export function optionLabel(f: QueryField, v: unknown): string | undefined {
    return normalizeOptions(f.options ?? [], queryAccessors)
        .flatMap((g) => g.items)
        .find((o) => sameValue(o.value, v))?.label;
}

export type QueryError = { key?: MessageKey; text?: string };

const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);
export const sortPair = (v: unknown[]) => [...v].sort(cmp);

export function checkValue(f: QueryField, v: unknown): QueryError | null {
    switch (f.type ?? "text") {
        case "number": {
            if (typeof v !== "number" || !Number.isFinite(v))
                return { key: "invalidNumber" };
            if (
                (f.min != null && v < Number(f.min)) ||
                (f.max != null && v > Number(f.max))
            )
                return { key: "outOfRange" };
            return null;
        }
        case "date": {
            if (typeof v !== "string" || !PlainDateTime.fromISO(v))
                return { key: "invalidDate" };
            if (
                (f.min != null && v < String(f.min)) ||
                (f.max != null && v > String(f.max))
            )
                return { key: "outOfRange" };
            return null;
        }
        case "text":
            return typeof v === "string" && v.trim()
                ? null
                : { key: "required" };
        default:
            return v === undefined || v === null || v === ""
                ? { key: "required" }
                : null;
    }
}

/** `null` when the item is fine, otherwise what is wrong (a message key or a custom text). */
export function validateItem(f: QueryField, it: QueryItem): QueryError | null {
    const ar = opArity(it.op);
    if (ar === "none") return null;
    if (it.value === undefined || it.value === null) return { key: "required" };
    const list = Array.isArray(it.value);
    if (ar === "one" ? list : !list) return { key: "required" };
    const vals = list ? (it.value as unknown[]) : [it.value];
    if (!vals.length || (ar === "two" && vals.length !== 2))
        return { key: "required" };
    for (const v of vals) {
        const bad = checkValue(f, v);
        if (bad) return bad;
    }
    if (ar === "two" && cmp(vals[0], vals[1]) > 0)
        return { key: "endBeforeStart" };
    const custom = f.validate?.(it.value, it.op);
    return typeof custom === "string" && custom ? { text: custom } : null;
}

// ---- query string: ?filter[user]=42&filter[age][lt]=30&filter[date_create][gt]=2026-11-01&filter[type][in]=1,2

const NAME: Record<Operator, string> = {
    "=": "",
    "!=": "ne",
    "<": "lt",
    "<=": "lte",
    ">": "gt",
    ">=": "gte",
    in: "in",
    nin: "nin",
    between: "between",
    empty: "empty",
    nempty: "nempty",
    contains: "contains",
    starts: "starts"
};

const scalar = (v: unknown) =>
    v === true ? "1" : v === false ? "0" : String(v);

// ponytail: the same key + operator twice (age >= 20 and age >= 25) overwrites in a query
// string; use the JSON form for those. Add `[]` suffixes when a backend needs it.
export function toQueryString(
    items: QueryItem[],
    o: { param?: string } = {}
): string {
    const p = o.param ?? "filter";
    return items
        .map((it) => {
            const key = it.variant ? `${it.key}_${it.variant}` : it.key;
            const name = NAME[it.op];
            const raw =
                opArity(it.op) === "none"
                    ? "1"
                    : Array.isArray(it.value)
                      ? it.value.map(scalar).join(",")
                      : scalar(it.value);
            return `${p}[${key}]${name ? `[${name}]` : ""}=${encodeURIComponent(raw).replace(/%2C/g, ",")}`;
        })
        .join("&");
}

function resolveField(fields: QueryField[], name: string) {
    for (const f of fields) {
        if (f.key === name) return { field: f };
        for (const v of f.variants ?? [])
            if (`${f.key}_${v.key}` === name)
                return { field: f, variant: v.key };
    }
    return null;
}

function parseOne(f: QueryField, s: string): unknown {
    switch (f.type ?? "text") {
        case "number":
            return Number(s);
        case "boolean":
            return s === "1" || s === "true";
        case "select":
        case "entity": {
            const hit = normalizeOptions(f.options ?? [], queryAccessors)
                .flatMap((g) => g.items)
                .find((o) => sameValue(o.value, s));
            if (hit) return hit.value;
            // ponytail: ids without a known option list: digits become numbers.
            return /^-?\d+$/.test(s) ? Number(s) : s;
        }
        default:
            return s;
    }
}

/** Reads what `toQueryString` wrote. Unknown fields and operators are skipped. */
export function fromQueryString(
    qs: string,
    fields: QueryField[],
    o: { param?: string } = {}
): QueryItem[] {
    const p = (o.param ?? "filter").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^${p}\\[([^\\]]+)\\](?:\\[([^\\]]+)\\])?$`);
    const out: QueryItem[] = [];
    for (const [k, raw] of new URLSearchParams(qs.replace(/^\?/, ""))) {
        const m = re.exec(k);
        if (!m) continue;
        const op = (Object.keys(NAME) as Operator[]).find(
            (x) => NAME[x] === (m[2] ?? "")
        );
        const hit = resolveField(fields, m[1]!);
        if (!op || !hit) continue;
        const item: QueryItem = { key: hit.field.key, op };
        if (hit.variant) item.variant = hit.variant;
        const ar = opArity(op);
        if (ar === "list" || ar === "two")
            item.value = raw.split(",").map((s) => parseOne(hit.field, s));
        else if (ar === "one") item.value = parseOne(hit.field, raw);
        out.push(item);
    }
    return out;
}
