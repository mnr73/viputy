export interface ZoneOption {
    /** IANA id, e.g. `Asia/Tehran`. This is the value to store. */
    value: string;
    /** Localised name, e.g. "Iran Standard Time". */
    label: string;
    /** `UTC+03:30 · Asia/Tehran` (underscores shown as spaces so "new york" matches): the part people search by. */
    description: string;
    /** Minutes east of UTC at the chosen moment. */
    offset: number;
}

const names = (
    zone: string,
    locale: string,
    style: "longOffset" | "longGeneric",
    at: Date
) =>
    new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: style })
        .formatToParts(at)
        .find((p) => p.type === "timeZoneName")?.value ?? "";

/** `GMT+03:30` -> minutes. `GMT` alone is 0. */
function minutes(gmt: string): number {
    const m = /([+-\u2212])(\d{1,2}):?(\d{2})?/.exec(gmt);
    if (!m) return 0;
    const n = Number(m[2]) * 60 + Number(m[3] ?? 0);
    return m[1] === "+" ? n : -n;
}

export function formatOffset(min: number): string {
    const a = Math.abs(min);
    const hh = String(Math.floor(a / 60)).padStart(2, "0");
    const mm = String(a % 60).padStart(2, "0");
    return `UTC${min < 0 ? "-" : "+"}${hh}:${mm}`;
}

/** The browser's zone (e.g. `Asia/Tehran`), or `null` where it cannot be read. Call on the client only. */
export function detectTimeZone(): string | null {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
        return null;
    }
}

const cache = new Map<string, ZoneOption[]>();

/**
 * Every IANA zone the runtime knows, plus `UTC`, sorted by offset then id. Offsets are for `at`
 * (default now), so a zone with daylight saving shows the offset of that date. Names are localised;
 * the offset always uses Latin digits so it sorts and reads the same in every language.
 */
export function timeZoneOptions(
    locale = "en",
    at: Date = new Date(),
    zones?: readonly string[],
    /** Ids to list even when the runtime's own list lacks them (e.g. `Asia/Kolkata` vs `Asia/Calcutta`). */
    include: readonly string[] = []
): ZoneOption[] {
    const key = `${locale}|${at.toISOString().slice(0, 13)}|${zones?.join(",") ?? ""}|${include.join(",")}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const ids = zones
        ? [...zones]
        : [
              ...new Set([
                  "UTC",
                  ...(typeof Intl.supportedValuesOf === "function"
                      ? Intl.supportedValuesOf("timeZone")
                      : []),
                  ...include
              ])
          ];
    const out: ZoneOption[] = [];
    for (const id of ids) {
        let offset: number, label: string;
        try {
            offset = minutes(names(id, "en", "longOffset", at));
            label = names(id, locale, "longGeneric", at) || id;
        } catch {
            continue; // unknown id: skip instead of breaking the whole list
        }
        out.push({
            value: id,
            label: id === "UTC" ? "UTC" : label,
            description: `${formatOffset(offset)} \u00b7 ${id.replace(/_/g, " ")}`,
            offset
        });
    }
    out.sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value));
    if (cache.size > 20) cache.clear();
    cache.set(key, out);
    return out;
}
