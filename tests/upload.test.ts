import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { ViUpload, viputy, type UploadFile } from "../src";

// ---- a controllable XMLHttpRequest
class FakeXhr {
    static all: FakeXhr[] = [];
    method = "";
    url = "";
    headers: Record<string, string> = {};
    body: FormData | null = null;
    status = 0;
    responseText = "";
    withCredentials = false;
    timeout = 0;
    aborted = false;
    upload: { onprogress: ((e: any) => void) | null } = { onprogress: null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    ontimeout: (() => void) | null = null;
    onabort: (() => void) | null = null;
    constructor() {
        FakeXhr.all.push(this);
    }
    open(m: string, u: string) {
        this.method = m;
        this.url = u;
    }
    setRequestHeader(k: string, v: string) {
        this.headers[k] = v;
    }
    send(b: FormData) {
        this.body = b;
    }
    abort() {
        this.aborted = true;
        this.onabort?.();
    }
    progress(loaded: number, total: number) {
        this.upload.onprogress?.({ lengthComputable: true, loaded, total });
    }
    respond(status: number, body: unknown) {
        this.status = status;
        this.responseText =
            typeof body === "string" ? body : JSON.stringify(body);
        this.onload?.();
    }
}

const flush = async () => {
    for (let i = 0; i < 4; i++) await nextTick();
    await new Promise((r) => setTimeout(r, 0));
};
const file = (name: string, size = 100, type = "") => {
    const f = new File([new Uint8Array(size)], name, { type });
    return f;
};
const make = (props: Record<string, unknown> = {}, locale = "en") =>
    mount(ViUpload, {
        props: { modelValue: [], ...props },
        attachTo: document.body,
        global: { plugins: [[viputy, { locale }]] as any }
    });
const pick = async (w: ReturnType<typeof make>, files: File[]) => {
    const input = w.find("input[type=file]");
    Object.defineProperty(input.element, "files", {
        value: files,
        configurable: true
    });
    await input.trigger("change");
    await flush();
};
const last = (w: ReturnType<typeof make>) =>
    w.emitted("update:modelValue")!.at(-1)![0] as UploadFile[];
/** the parent keeps the model in sync, like v-model does */
const synced = (props: Record<string, unknown> = {}, locale = "en") => {
    const w = make(props, locale);
    w.vm.$.emit; // keep the type checker quiet about unused
    w.setProps({
        "onUpdate:modelValue": (v: UploadFile[]) =>
            w.setProps({ modelValue: v })
    } as any);
    return w;
};

beforeEach(() => {
    FakeXhr.all = [];
    vi.stubGlobal("XMLHttpRequest", FakeXhr);
    if (!URL.createObjectURL) (URL as any).createObjectURL = () => "blob:x";
    if (!URL.revokeObjectURL) (URL as any).revokeObjectURL = () => {};
});
afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
});

describe("ViUpload validation", () => {
    it("rejects by extension, size and name, and says why in the user's language", async () => {
        const w = synced({
            accept: ".pdf",
            maxSize: "1KB",
            namePattern: /^[a-z0-9-]+\.[a-z]+$/,
            multiple: true
        });
        await pick(w, [
            file("ok.pdf", 100),
            file("big.pdf", 5000),
            file("pic.png", 10),
            file("Bad Name.pdf", 10)
        ]);
        const msgs = w
            .findAll(".vi-upload__alert span[dir]")
            .map((s) => s.text());
        expect(msgs).toHaveLength(3);
        expect(msgs[0]).toContain("larger than 1 kB");
        expect(msgs[1]).toContain("file type not allowed (PDF)");
        expect(msgs[2]).toContain("file name is not allowed");
        expect(last(w).map((f) => f.name)).toEqual(["ok.pdf"]);
        expect(w.emitted("reject")![0]![0]).toHaveLength(3);
        w.unmount();
    });
    it("messages are Persian in fa, with Persian digits", async () => {
        const w = synced({ maxSize: "1KB" }, "fa");
        await pick(w, [file("big.pdf", 5000)]);
        expect(w.find(".vi-upload__alerts").text()).toContain(
            "بزرگ‌تر از ۱ کیلوبایت"
        );
        w.unmount();
    });
    it("custom validate: a string is the message, false uses the default", async () => {
        const w = synced({
            multiple: true,
            validate: (f: File) =>
                f.name.startsWith("x")
                    ? "No x files"
                    : f.name.startsWith("y")
                      ? false
                      : true
        });
        await pick(w, [file("x1.txt"), file("y1.txt"), file("z1.txt")]);
        const msgs = w
            .findAll(".vi-upload__alert span[dir]")
            .map((s) => s.text());
        expect(msgs).toEqual(["No x files", "“y1.txt”: file not accepted"]);
        expect(last(w).map((f) => f.name)).toEqual(["z1.txt"]);
        w.unmount();
    });
    it("max-files: extras are rejected with the limit", async () => {
        const w = synced({ multiple: true, maxFiles: 2 });
        await pick(w, [file("a.txt"), file("b.txt"), file("c.txt")]);
        expect(last(w)).toHaveLength(2);
        expect(w.find(".vi-upload__alerts").text()).toContain(
            "at most 2 files"
        );
        expect(w.find(".vi-upload__zone").exists()).toBe(false); // full: the zone goes away
        w.unmount();
    });
    it("single mode replaces the file", async () => {
        const w = synced({});
        await pick(w, [file("a.txt")]);
        await pick(w, [file("b.txt")]);
        expect(last(w).map((f) => f.name)).toEqual(["b.txt"]);
        w.unmount();
    });
    it("the picker only offers what is allowed", () => {
        const w = make({ accept: [".pdf", "image/*"], multiple: true });
        const i = w.find("input[type=file]");
        expect(i.attributes("accept")).toBe(".pdf,image/*");
        expect(i.attributes("multiple")).toBeDefined();
        w.unmount();
    });
});

describe("ViUpload uploading", () => {
    it("posts to the url with headers and fields, shows progress, then done with the server answer", async () => {
        const w = synced({
            url: "/api/files",
            headers: { Authorization: "Bearer t" },
            data: { folder: "7" },
            fieldName: "doc"
        });
        await pick(w, [file("a.pdf", 1000)]);
        expect(FakeXhr.all).toHaveLength(1);
        const x = FakeXhr.all[0]!;
        expect(x.method).toBe("POST");
        expect(x.url).toBe("/api/files");
        expect(x.headers.Authorization).toBe("Bearer t");
        expect((x.body!.get("doc") as File).name).toBe("a.pdf");
        expect(x.body!.get("folder")).toBe("7");
        x.progress(250, 1000);
        await flush();
        expect(w.find(".vi-upload__pct").text()).toBe("25%");
        expect(w.find("[role=progressbar]").attributes("aria-valuenow")).toBe(
            "25"
        );
        x.respond(201, { id: 55, url: "/files/a.pdf" });
        await flush();
        const f = last(w)[0]!;
        expect(f.status).toBe("done");
        expect(f.id).toBe(55);
        expect(f.url).toBe("/files/a.pdf");
        expect(w.emitted("success")).toHaveLength(1);
        w.unmount();
    });
    it("progress is Persian in fa", async () => {
        const w = synced({ url: "/u" }, "fa");
        await pick(w, [file("a.pdf", 1000)]);
        FakeXhr.all[0]!.progress(680, 1000);
        await flush();
        expect(w.find(".vi-upload__pct").text()).toBe("۶۸٪");
        w.unmount();
    });
    it("no progress from the server: an indeterminate bar, no percentage", async () => {
        const w = synced({ url: "/u" });
        await pick(w, [file("a.pdf", 1000)]);
        FakeXhr.all[0]!.upload.onprogress?.({
            lengthComputable: false,
            loaded: 0,
            total: 0
        });
        await flush();
        const bar = w.find("[role=progressbar]");
        expect(bar.attributes("data-indeterminate")).toBeDefined();
        expect(bar.attributes("aria-valuenow")).toBeUndefined();
        expect(w.find(".vi-upload__pct").text()).toBe("");
        w.unmount();
    });
    it("a server error shows the server's message and offers retry", async () => {
        const w = synced({ url: "/u" });
        await pick(w, [file("a.pdf")]);
        FakeXhr.all[0]!.respond(422, {
            message: "invalid",
            errors: { file: ["The file must be a PDF."] }
        });
        await flush();
        expect(last(w)[0]!.status).toBe("error");
        expect(w.find(".vi-upload__err").text()).toContain(
            "The file must be a PDF."
        );
        expect(w.emitted("error")).toHaveLength(1);
        await w.find('[aria-label^="Retry"]').trigger("click");
        await flush();
        expect(FakeXhr.all).toHaveLength(2);
        FakeXhr.all[1]!.respond(200, {});
        await flush();
        expect(last(w)[0]!.status).toBe("done");
        w.unmount();
    });
    it("a body that is not JSON still gives a readable error", async () => {
        const w = synced({ url: "/u" });
        await pick(w, [file("a.pdf")]);
        FakeXhr.all[0]!.respond(500, "<html>boom</html>");
        await flush();
        expect(w.find(".vi-upload__err").text()).toContain(
            "Upload failed (500)"
        );
        w.unmount();
    });
    it("a network error", async () => {
        const w = synced({ url: "/u" });
        await pick(w, [file("a.pdf")]);
        FakeXhr.all[0]!.onerror?.();
        await flush();
        expect(w.find(".vi-upload__err").text()).toContain("Network error");
        w.unmount();
    });
    it("one request per file, at most `concurrency` at a time", async () => {
        const w = synced({ url: "/u", multiple: true, concurrency: 2 });
        await pick(w, [file("a.txt"), file("b.txt"), file("c.txt")]);
        expect(FakeXhr.all).toHaveLength(2); // the third waits
        FakeXhr.all[0]!.respond(200, {});
        await flush();
        expect(FakeXhr.all).toHaveLength(3);
        w.unmount();
    });
    it("batch: ONE request carries every file as file[]; progress is split across them", async () => {
        const w = synced({ url: "/u", multiple: true, batch: true });
        await pick(w, [file("a.txt", 100), file("b.txt", 100)]);
        expect(FakeXhr.all).toHaveLength(1);
        const x = FakeXhr.all[0]!;
        expect(x.body!.getAll("file[]").map((f) => (f as File).name)).toEqual([
            "a.txt",
            "b.txt"
        ]);
        x.progress(150, 200);
        await flush();
        const pcts = w.findAll(".vi-upload__pct").map((p) => p.text());
        expect(pcts).toEqual(["100%", "50%"]);
        x.respond(200, [
            { id: 1, url: "/a" },
            { id: 2, url: "/b" }
        ]);
        await flush();
        expect(last(w).map((f) => [f.id, f.url, f.status])).toEqual([
            [1, "/a", "done"],
            [2, "/b", "done"]
        ]);
        w.unmount();
    });
    it("auto=false waits for the Upload button", async () => {
        const w = synced({ url: "/u", multiple: true, auto: false });
        await pick(w, [file("a.txt"), file("b.txt")]);
        expect(FakeXhr.all).toHaveLength(0);
        const btn = w.find(".vi-upload__send");
        expect(btn.text()).toBe("Upload 2 files");
        await btn.trigger("click");
        await flush();
        expect(FakeXhr.all).toHaveLength(2);
        w.unmount();
    });
    it("cancel aborts the request and removes the file", async () => {
        const w = synced({ url: "/u" });
        await pick(w, [file("a.pdf")]);
        await w.find('[aria-label^="Cancel upload"]').trigger("click");
        await flush();
        expect(FakeXhr.all[0]!.aborted).toBe(true);
        expect(last(w)).toEqual([]);
        expect(w.find(".vi-upload__err").exists()).toBe(false);
        w.unmount();
    });
    it("cancelling one file of a batch cancels the whole request", async () => {
        const w = synced({ url: "/u", multiple: true, batch: true });
        await pick(w, [file("a.txt"), file("b.txt")]);
        await w.findAll('[aria-label^="Cancel upload"]')[0]!.trigger("click");
        await flush();
        expect(FakeXhr.all[0]!.aborted).toBe(true);
        expect(last(w)).toEqual([]);
        w.unmount();
    });
    it("a custom uploader replaces the url (any server, S3, tus...)", async () => {
        const uploader = vi.fn(async ({ files, progress }: any) => {
            progress(0.5);
            return { url: `/cdn/${files[0].name}` };
        });
        const w = synced({ uploader });
        await pick(w, [file("a.pdf")]);
        expect(uploader).toHaveBeenCalledTimes(1);
        expect(FakeXhr.all).toHaveLength(0);
        expect(last(w)[0]).toMatchObject({ status: "done", url: "/cdn/a.pdf" });
        w.unmount();
    });
    it("mapResponse shapes the file from any answer", async () => {
        const w = synced({
            url: "/u",
            mapResponse: (r: any) => ({ id: r.data.uuid, url: r.data.href })
        });
        await pick(w, [file("a.pdf")]);
        FakeXhr.all[0]!.respond(200, { data: { uuid: "abc", href: "/h/abc" } });
        await flush();
        expect(last(w)[0]).toMatchObject({
            id: "abc",
            url: "/h/abc",
            status: "done"
        });
        w.unmount();
    });
    it("without url or uploader the files are only collected (the form submits them itself)", async () => {
        const w = synced({ multiple: true });
        await pick(w, [file("a.txt")]);
        expect(FakeXhr.all).toHaveLength(0);
        expect(last(w)[0]).toMatchObject({ status: "pending", name: "a.txt" });
        expect(last(w)[0]!.file).toBeInstanceOf(File);
        w.unmount();
    });
});

describe("ViUpload existing files, remove, sort, preview", () => {
    const existing: UploadFile[] = [
        { id: 1, name: "a.pdf", size: 2048, url: "/f/a.pdf" },
        {
            id: 2,
            name: "b.png",
            size: 1024,
            url: "/f/b.png",
            type: "image/png"
        },
        { id: 3, name: "c.mp3", size: 9, url: "/f/c.mp3" }
    ];
    it("shows saved files with size, download and remove", () => {
        const w = make({ modelValue: existing, multiple: true });
        expect(w.findAll(".vi-upload__item")).toHaveLength(3);
        expect(w.findAll(".vi-upload__meta")[0]!.text()).toBe("2 kB");
        expect(w.find('a[download="a.pdf"]').attributes("href")).toBe(
            "/f/a.pdf"
        );
        expect(
            w.findAll(".vi-upload__item")[1]!.find("img").attributes("src")
        ).toBe("/f/b.png");
        w.unmount();
    });
    it("remove emits the new list and the removed file", async () => {
        const w = synced({ modelValue: existing, multiple: true });
        await w.findAll('[aria-label^="Remove"]')[1]!.trigger("click");
        await flush();
        expect(last(w).map((f) => f.id)).toEqual([1, 3]);
        expect((w.emitted("remove")![0]![0] as UploadFile).id).toBe(2);
        w.unmount();
    });
    it("beforeRemove can veto, and the button is busy while it runs", async () => {
        let resolve!: (v: boolean) => void;
        const w = synced({
            modelValue: existing,
            multiple: true,
            beforeRemove: () => new Promise<boolean>((r) => (resolve = r))
        });
        const btn = w.findAll('[aria-label^="Remove"]')[0]!;
        await btn.trigger("click");
        await nextTick();
        expect(btn.attributes("disabled")).toBeDefined();
        resolve(false);
        await flush();
        expect(w.emitted("update:modelValue")).toBeUndefined();
        expect(w.findAll(".vi-upload__item")).toHaveLength(3);
        w.unmount();
    });
    it("sort with the keyboard: ArrowDown / ArrowUp / Home / End, announced to screen readers", async () => {
        const w = synced({
            modelValue: existing,
            multiple: true,
            reorderable: true
        });
        const grips = () => w.findAll(".vi-upload__grip");
        await grips()[0]!.trigger("keydown", { key: "ArrowDown" });
        await flush();
        expect(last(w).map((f) => f.id)).toEqual([2, 1, 3]);
        expect(w.find(".vi-upload__sr").text()).toBe("a.pdf: position 2 of 3");
        await grips()[2]!.trigger("keydown", { key: "Home" });
        await flush();
        expect(last(w).map((f) => f.id)).toEqual([3, 2, 1]);
        await grips()[0]!.trigger("keydown", { key: "ArrowUp" }); // already first: no change
        await flush();
        expect(last(w).map((f) => f.id)).toEqual([3, 2, 1]);
        w.unmount();
    });
    it("no handles unless reorderable (and not with a single file)", () => {
        expect(
            make({ modelValue: existing, multiple: true }).findAll(
                ".vi-upload__grip"
            )
        ).toHaveLength(0);
        expect(
            make({
                modelValue: [existing[0]],
                multiple: true,
                reorderable: true
            }).findAll(".vi-upload__grip")
        ).toHaveLength(0);
    });
    it("preview opens a viewer for images, with next/previous across previewable files only", async () => {
        const w = make({
            modelValue: [
                existing[0]!,
                existing[1]!,
                existing[2]!,
                { id: 4, name: "d.zip", url: "/f/d.zip" }
            ],
            multiple: true
        });
        await w.findAll(".vi-upload__thumb")[1]!.trigger("click");
        await flush();
        const dlg = document.body.querySelector("dialog.vi-upload__view")!;
        expect(dlg).toBeTruthy();
        expect(dlg.querySelector("img")!.getAttribute("src")).toBe("/f/b.png");
        expect(dlg.textContent).toContain("2 / 3"); // a.pdf, b.png, c.mp3 (the zip is not previewable)
        (dlg.querySelector(".vi-upload__nav--next") as HTMLElement).click();
        await flush();
        expect(
            document.body.querySelector("dialog audio")!.getAttribute("src")
        ).toBe("/f/c.mp3");
        w.unmount();
    });
    it("preview=false: no viewer", () => {
        const w = make({
            modelValue: existing,
            multiple: true,
            preview: false
        });
        expect(w.findAll("button.vi-upload__thumb")).toHaveLength(0);
        w.unmount();
    });
    it("readonly: no zone, no remove, still downloadable", () => {
        const w = make({
            modelValue: existing,
            multiple: true,
            readonly: true
        });
        expect(w.find(".vi-upload__zone").exists()).toBe(false);
        expect(w.findAll('[aria-label^="Remove"]')).toHaveLength(0);
        expect(w.findAll("a[download]")).toHaveLength(3);
        w.unmount();
    });
    it("disabled: the zone cannot take a drop", async () => {
        const w = make({ disabled: true });
        const input = w.find("input[type=file]");
        expect(input.attributes("disabled")).toBeDefined();
        expect(w.find(".vi-upload__zone").attributes("aria-disabled")).toBe(
            "true"
        );
        w.unmount();
    });
});

describe("ViUpload drag and drop", () => {
    const dropEvent = (type: string, files: File[] = []) => {
        const e = new Event(type, { bubbles: true, cancelable: true }) as any;
        e.dataTransfer = { types: ["Files"], files, dropEffect: "" };
        return e;
    };
    it("shows the dragging state, ignores non-file drags, and accepts the drop", async () => {
        const w = synced({ multiple: true });
        const zone = w.find(".vi-upload__zone").element;
        const textDrag = new Event("dragenter", { bubbles: true }) as any;
        textDrag.dataTransfer = { types: ["text/plain"] };
        zone.dispatchEvent(textDrag);
        await nextTick();
        expect(
            w.find(".vi-upload").attributes("data-dragging")
        ).toBeUndefined();
        zone.dispatchEvent(dropEvent("dragenter"));
        await nextTick();
        expect(w.find(".vi-upload").attributes("data-dragging")).toBeDefined();
        zone.dispatchEvent(dropEvent("drop", [file("a.txt")]));
        await flush();
        expect(
            w.find(".vi-upload").attributes("data-dragging")
        ).toBeUndefined();
        expect(last(w).map((f) => f.name)).toEqual(["a.txt"]);
        w.unmount();
    });
    it("dragging over child elements does not flicker the state off", async () => {
        const w = make({});
        const zone = w.find(".vi-upload__zone").element;
        zone.dispatchEvent(dropEvent("dragenter"));
        zone.dispatchEvent(dropEvent("dragenter")); // entered a child
        zone.dispatchEvent(dropEvent("dragleave")); // left the parent element of the pair
        await nextTick();
        expect(w.find(".vi-upload").attributes("data-dragging")).toBeDefined();
        zone.dispatchEvent(dropEvent("dragleave"));
        await nextTick();
        expect(
            w.find(".vi-upload").attributes("data-dragging")
        ).toBeUndefined();
        w.unmount();
    });
});
