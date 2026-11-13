import { toLatinDigits } from "./text";

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface UploadFile {
    /** Stable key. New files get a generated one; give files that already exist your own id. */
    id: string | number;
    name: string;
    size?: number;
    type?: string;
    /** Where the file can be opened, downloaded and previewed. */
    url?: string;
    /** A smaller image for the list; falls back to `url`. */
    thumb?: string;
    /** Default: `"pending"` when `file` is set, otherwise `"done"`. */
    status?: UploadStatus;
    error?: string;
    /** The browser file (kept after the upload). */
    file?: File;
    /** What the server answered. */
    response?: unknown;
}

export type RejectReason =
    | "type"
    | "size-max"
    | "size-min"
    | "name"
    | "name-length"
    | "count"
    | "custom";

export interface Rejection {
    file: File;
    reason: RejectReason;
    message: string;
}

export type FileKind =
    "image" | "pdf" | "video" | "audio" | "doc" | "sheet" | "archive" | "other";

export interface PreviewItem {
    id: string | number;
    name: string;
    kind: FileKind;
    src: string;
}

// ---- sizes

const UNITS: Record<string, number> = {
    b: 1,
    k: 1024,
    kb: 1024,
    kib: 1024,
    m: 1024 ** 2,
    mb: 1024 ** 2,
    mib: 1024 ** 2,
    g: 1024 ** 3,
    gb: 1024 ** 3,
    gib: 1024 ** 3,
    t: 1024 ** 4,
    tb: 1024 ** 4,
    tib: 1024 ** 4
};

/** `10485760`, `"10MB"`, `"500 kb"`, `"1.5GB"` -> bytes (1 KB = 1024 B). Anything else -> `undefined`. */
export function parseBytes(
    v: number | string | null | undefined
): number | undefined {
    if (typeof v === "number")
        return Number.isFinite(v) && v >= 0 ? v : undefined;
    if (typeof v !== "string") return undefined;
    const m = /^\s*(\d+(?:[.,]\d+)?)\s*([a-z]*)\s*$/i.exec(toLatinDigits(v));
    if (!m) return undefined;
    const unit = UNITS[(m[2] || "b").toLowerCase()];
    if (unit === undefined) return undefined;
    return Math.round(Number(m[1]!.replace(",", ".")) * unit);
}

/** `1536` -> `"1.5 kB"` (en) / `"۱٫۵ کیلوبایت"` (fa). */
export function formatBytes(n: number, locale = "en"): string {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
    let i = 0;
    let v = Math.max(0, n);
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return new Intl.NumberFormat(locale, {
        style: "unit",
        unit: units[i]!,
        unitDisplay: locale.split("-")[0] === "fa" ? "long" : "short",
        maximumFractionDigits: i === 0 ? 0 : 1
    }).format(v);
}

// ---- accept / validation

/** `".pdf, image/*"` or an array -> `[".pdf", "image/*"]` (lower case, trimmed). */
export function acceptList(
    accept: string | string[] | null | undefined
): string[] {
    const list = Array.isArray(accept) ? accept : (accept ?? "").split(",");
    return list.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export function extOf(name: string): string {
    const i = name.lastIndexOf(".");
    return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Like the native `accept` attribute: `.ext`, `type/sub` and `type/*`. No tokens = everything. */
export function matchesAccept(
    file: { name: string; type: string },
    tokens: string[]
): boolean {
    if (!tokens.length) return true;
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    return tokens.some((t) =>
        t.startsWith(".")
            ? name.endsWith(t)
            : t.endsWith("/*")
              ? type.startsWith(t.slice(0, -1))
              : type === t
    );
}

export interface FileRules {
    tokens?: string[];
    maxSize?: number;
    minSize?: number;
    namePattern?: RegExp;
    maxNameLength?: number;
}

/** First rule a file breaks, or `null`. Order: name length, name pattern, type, max size, min size. */
export function validateFile(
    file: { name: string; type: string; size: number },
    r: FileRules
): Exclude<RejectReason, "count" | "custom"> | null {
    if (r.maxNameLength != null && file.name.length > r.maxNameLength)
        return "name-length";
    if (r.namePattern) {
        r.namePattern.lastIndex = 0; // a /g or /y pattern keeps state between calls
        if (!r.namePattern.test(file.name)) return "name";
    }
    if (r.tokens?.length && !matchesAccept(file, r.tokens)) return "type";
    if (r.maxSize != null && file.size > r.maxSize) return "size-max";
    if (r.minSize != null && file.size < r.minSize) return "size-min";
    return null;
}

/** Short names for an accept list: `.pdf` -> PDF, `image/*` -> Images. Unknown long types are skipped. */
export function describeAccept(
    tokens: string[],
    labels: { images: string; videos: string; audio: string },
    locale = "en"
): string {
    const out: string[] = [];
    for (const t of tokens) {
        let s = "";
        if (t.startsWith(".")) s = t.slice(1).toUpperCase();
        else if (t === "image/*") s = labels.images;
        else if (t === "video/*") s = labels.videos;
        else if (t === "audio/*") s = labels.audio;
        else {
            const sub = t.split("/")[1] ?? "";
            if (sub && sub !== "*" && !/[.+]/.test(sub)) s = sub.toUpperCase();
        }
        if (s && !out.includes(s)) out.push(s);
    }
    const shown = out.length > 4 ? [...out.slice(0, 4), "…"] : out;
    try {
        return new Intl.ListFormat(locale, {
            type: "unit",
            style: "narrow"
        }).format(shown);
    } catch {
        return shown.join(", ");
    }
}

// ---- kinds

const IMG = new Set([
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "avif",
    "svg",
    "bmp",
    "ico"
]);
const VID = new Set(["mp4", "webm", "mov", "mkv", "avi", "m4v", "ogv"]);
const AUD = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "oga"]);
const DOC = new Set(["doc", "docx", "odt", "rtf", "txt", "md"]);
const SHEET = new Set(["xls", "xlsx", "ods", "csv"]);
const ARC = new Set(["zip", "rar", "7z", "tar", "gz", "tgz"]);

export function kindOf(f: { name?: string; type?: string }): FileKind {
    const t = (f.type ?? "").toLowerCase();
    const e = extOf(f.name ?? "");
    if (t.startsWith("image/") || IMG.has(e)) return "image";
    if (t === "application/pdf" || e === "pdf") return "pdf";
    if (t.startsWith("video/") || VID.has(e)) return "video";
    if (t.startsWith("audio/") || AUD.has(e)) return "audio";
    if (SHEET.has(e) || /spreadsheet|excel|csv/.test(t)) return "sheet";
    if (DOC.has(e) || /word|document|text\/plain|rtf/.test(t)) return "doc";
    if (ARC.has(e) || /zip|rar|7z|tar|gzip/.test(t)) return "archive";
    return "other";
}

// ---- lists and progress

/** A copy of `arr` with the item at `from` moved to `to`. */
export function moveItem<T>(arr: readonly T[], from: number, to: number): T[] {
    const out = [...arr];
    if (from < 0 || from >= out.length) return out;
    const [item] = out.splice(from, 1);
    out.splice(Math.max(0, Math.min(to, out.length)), 0, item as T);
    return out;
}

/**
 * One request carries several files back to back, so the bytes sent so far say how far each file is:
 * file 1 fills first, then file 2... An approximation (multipart framing adds a few bytes).
 */
export function splitProgress(sizes: number[], fraction: number): number[] {
    const total = sizes.reduce((a, b) => a + b, 0);
    const sent = Math.max(0, Math.min(1, fraction)) * total;
    let offset = 0;
    return sizes.map((s) => {
        const p = s === 0 ? (sent >= offset ? 1 : 0) : (sent - offset) / s;
        offset += s;
        return Math.max(0, Math.min(1, p));
    });
}

// ---- uploading

export interface UploadContext {
    /** One file, or all files of the batch. */
    files: File[];
    signal: AbortSignal;
    /** `0..1` of the whole request, or `null` when the total is unknown. */
    progress(fraction: number | null): void;
}
/** Resolve with the server's answer. Batch: an array in file order is split per file. */
export type Uploader = (ctx: UploadContext) => Promise<unknown>;

export class UploadError extends Error {
    constructor(
        message: string,
        readonly status?: number,
        readonly body?: unknown,
        readonly code: "http" | "network" | "timeout" = "http"
    ) {
        super(message);
        this.name = "UploadError";
    }
}

export interface XhrOptions {
    url: string;
    method?: string;
    /** Form field of the file. A batch sends `<fieldName>[]`. Default `"file"`. */
    fieldName?: string;
    batch?: boolean;
    headers?: Record<string, string> | (() => Record<string, string>);
    /** Extra form fields. */
    data?:
        | Record<string, string | Blob>
        | ((files: File[]) => Record<string, string | Blob>);
    withCredentials?: boolean;
    /** Milliseconds. */
    timeout?: number;
}

/** A readable message from a JSON error body (Laravel: `message`, or the first of `errors`). */
export function serverMessage(body: unknown): string {
    if (!body || typeof body !== "object") return "";
    const b = body as { message?: unknown; errors?: unknown };
    if (b.errors && typeof b.errors === "object") {
        for (const v of Object.values(b.errors as Record<string, unknown>)) {
            const first = Array.isArray(v) ? v[0] : v;
            if (typeof first === "string" && first) return first;
        }
    }
    return typeof b.message === "string" ? b.message : "";
}

/** The built-in uploader: multipart POST with `XMLHttpRequest` (fetch cannot report upload progress). */
export function xhrUploader(o: XhrOptions): Uploader {
    return ({ files, signal, progress }) =>
        new Promise((resolve, reject) => {
            const aborted = () => new DOMException("Aborted", "AbortError");
            if (signal.aborted) return reject(aborted());
            const xhr = new XMLHttpRequest();
            xhr.open(o.method ?? "POST", o.url);
            const headers =
                typeof o.headers === "function" ? o.headers() : o.headers;
            for (const [k, v] of Object.entries(headers ?? {}))
                xhr.setRequestHeader(k, v);
            if (o.withCredentials) xhr.withCredentials = true;
            if (o.timeout) xhr.timeout = o.timeout;

            const form = new FormData();
            const extra = typeof o.data === "function" ? o.data(files) : o.data;
            for (const [k, v] of Object.entries(extra ?? {})) form.append(k, v);
            const field = o.fieldName ?? "file";
            for (const f of files)
                form.append(o.batch ? `${field}[]` : field, f, f.name);

            xhr.upload.onprogress = (e) =>
                progress(
                    e.lengthComputable && e.total > 0
                        ? e.loaded / e.total
                        : null
                );
            xhr.onload = () => {
                let body: unknown = xhr.responseText;
                try {
                    body = xhr.responseText
                        ? JSON.parse(xhr.responseText)
                        : undefined;
                } catch {
                    /* not JSON: keep the text */
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    progress(1);
                    resolve(body);
                } else {
                    reject(
                        new UploadError(serverMessage(body), xhr.status, body)
                    );
                }
            };
            xhr.onerror = () =>
                reject(new UploadError("", 0, undefined, "network"));
            xhr.ontimeout = () =>
                reject(new UploadError("", 0, undefined, "timeout"));
            xhr.onabort = () => reject(aborted());
            signal.addEventListener("abort", () => xhr.abort(), { once: true });
            xhr.send(form);
        });
}
