import { PlainDateTime } from "./plain";

/**
 * Parse a `min`/`max` bound. A date-only `max` ("2026-12-31") means the whole
 * day is allowed, so it becomes 23:59:59; a date-only `min` is 00:00:00.
 */
export function parseBound(
    text: string | null | undefined,
    kind: "min" | "max"
): PlainDateTime | null {
    const s = (text ?? "").trim();
    if (!s) return null;
    const dt = PlainDateTime.fromISO(s);
    if (!dt) return null;
    return kind === "max" && !/[T ]/.test(s) ? dt.endOf("day") : dt;
}

/** True when the *day* is outside [min, max] (times are ignored). */
export function dayOutside(
    days: number,
    min: PlainDateTime | null,
    max: PlainDateTime | null
): boolean {
    return (!!min && days < min.days) || (!!max && days > max.days);
}
