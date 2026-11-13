# ViUpload

Drop zone, file list, upload with progress, preview and sort, in one input. It does two jobs: pick files to upload, and show the files that are already on the server (with sorting, download and remove).

<script setup>
import { ref } from "vue";
const one = ref([]);
const many = ref([]);
const saved = ref([
  { id: 1, name: "contract-1405.pdf", size: 482113, url: "https://example.com/contract.pdf" },
  { id: 2, name: "site-photo.png", size: 90211, type: "image/png", url: "data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%232563eb%27/%3E%3Ccircle cx=%27200%27 cy=%27130%27 r=%2760%27 fill=%27white%27/%3E%3C/svg%3E" },
  { id: 3, name: "price-list.xlsx", size: 30210, url: "https://example.com/p.xlsx" },
  { id: 4, name: "archive.zip", size: 7341022, url: "https://example.com/a.zip" }
]);
const grid = ref([]);
const slow = (ms) => ({ files, progress, signal }) => new Promise((resolve, reject) => {
  let p = 0;
  const id = setInterval(() => { p += 0.08; progress(Math.min(p, 1)); if (p >= 1) { clearInterval(id); resolve({ url: URL.createObjectURL(files[0]) }); } }, ms);
  signal.addEventListener("abort", () => { clearInterval(id); reject(new DOMException("Aborted", "AbortError")); });
});
const failing = () => Promise.reject(new Error("The server said no (demo)"));
const log = ref("");
</script>

<div class="demo">
  <ViUpload v-model="one" label="Contract (PDF, up to 10 MB)" accept=".pdf" max-size="10MB" :uploader="slow(120)" />
  <ViUpload v-model="many" label="Photos (max 5, 2 MB each)" multiple accept="image/*" max-size="2MB" :max-files="5" :uploader="slow(60)" reorderable layout="grid" @reject="log = $event.map(r => r.message).join(' / ')" />
  <ViUpload v-model="saved" label="Saved files (sort, download, remove)" multiple reorderable :uploader="slow(80)" />
  <ViUpload v-model="grid" label="Fails (demo)" :uploader="failing" />
</div>

```vue
<script setup>
import { ref } from "vue";
const files = ref([]);
</script>

<template>
  <ViUpload
    v-model="files"
    label="Contract"
    accept=".pdf"
    max-size="10MB"
    url="/api/uploads"
    :headers="{ Authorization: `Bearer ${token}` }"
  />
</template>
```

## The value

`v-model` is an array of files, also in single mode (it holds zero or one). A file is:

```ts
interface UploadFile {
  id: string | number;   // yours for saved files; generated for new ones, replaced by response.id
  name: string;
  size?: number;
  type?: string;
  url?: string;          // where it can be opened, downloaded and previewed
  thumb?: string;        // a smaller image for the list
  status?: "pending" | "uploading" | "done" | "error";
  error?: string;
  file?: File;           // the browser file (while it is new)
  response?: unknown;    // the server's answer
}
```

Files you load from your server have no `file` and no `status`: they count as `done`. After an upload the item keeps its order, gets `status: "done"` and the `id` / `url` from the answer. Save only the ones you need (`files.map(f => f.id)`).

## Uploading

| Prop | |
|---|---|
| `url` | upload here with a multipart POST |
| `method` | default `POST` (`PUT` works) |
| `field-name` | form field of the file, default `file`. A batch sends `file[]` |
| `headers` | object, or a function called per request (tokens that refresh) |
| `data` | extra form fields, object or `(files) => object` |
| `with-credentials` | send cookies cross-site |
| `timeout` | milliseconds |
| `uploader` | your own `({ files, signal, progress }) => Promise<response>`. Replaces `url`. Use it for S3, tus, chunking... |
| `batch` | send the files of one drop together in **one** request |
| `concurrency` | requests at the same time when not batching. Default 3 |
| `auto` | upload on add (default). `false` shows an **Upload N files** button |
| `map-response` | `(response, files) => Partial<UploadFile>` to read `id` / `url` from any answer |

Without `url` or `uploader` nothing is sent: the files stay in the list (`file` is set) and you submit them yourself, for example with the rest of a form.

The built-in uploader reads `{ id, url }` from the answer (also from `path` and `thumb`); for a batch it expects an array in file order. A 4xx/5xx answer shows the server's own message: Laravel's `errors` (first message) or `message`.

```php
// Laravel: one file
Route::post('/uploads', function (Request $r) {
    $r->validate(['file' => 'required|file|max:10240']);
    $path = $r->file('file')->store('uploads');
    return ['id' => Str::uuid(), 'url' => Storage::url($path)];
});
```

### Progress

A bar and a percentage show while the browser sends the file. This works only when the server lets the request body stream (`xhr.upload.onprogress`); if the browser cannot tell the total, the bar is an animation without a percentage (never a made-up number). With `batch`, one request carries all files, so the progress of the request is split by file size: the first file fills first. This is an approximation.

The percentage is the **sending** progress. A big file can sit at 100% while the server is still working on it; show your own state with `status` if you need that.

## Validation (before anything is sent)

| Prop | |
|---|---|
| `accept` | `".pdf,.docx"`, `"image/*"` or an array. The picker offers only these and a dropped file is checked against them (an extension must be the end of the name: `a.pdf.exe` is not a PDF) |
| `max-size` / `min-size` | bytes or `"10MB"`, `"500KB"` (1 KB = 1024 bytes) |
| `max-files` | most files in the list (with `multiple`) |
| `name-pattern` | a `RegExp` the file name must match |
| `max-name-length` | |
| `validate` | `(file) => string \| false \| void`: return a message (or `false` for the default one) to reject |

Rejected files are listed under the drop zone with the reason, in the user's language, and `@reject` gives you `{ file, reason, message }[]` (`reason`: `type`, `size-max`, `size-min`, `name`, `name-length`, `count`, `custom`). The other files of the same drop are still added. Client checks are for convenience: always validate on the server too.

## Preview

Images show a thumbnail. Click a thumbnail (images, PDF, video, audio) to open a viewer with next / previous (arrow keys; in RTL the right arrow goes back). The viewer is a native `<dialog>`: it traps focus, closes with Esc and returns focus. A file that has only been picked (no `url` yet) is previewed from the browser's own copy, so the user sees it before the upload. `preview="false"` turns it off, `thumb` gives a smaller list image.

## Sorting and removing

- `reorderable`: drag the handle, or focus it and use the arrow keys (Home / End jump). Moves are announced to screen readers. The new order is in `v-model`.
- Removing a file you uploaded just now cancels the request (a file in a `batch` cancels the whole batch). Removing a saved file emits the new list; `before-remove` can ask the server first: return `false` to keep it.
- `readonly` shows the list only (download and preview still work).

## Layout

`layout="grid"` shows cards, `variant="compact"` a one-line drop zone. The `drop` slot replaces the inside of the zone and the `file` slot the name and size of a row.

## Props, events, slots

| | |
|---|---|
| props | `modelValue` `multiple` `accept` `max-size` `min-size` `max-files` `name-pattern` `max-name-length` `validate` `url` `method` `field-name` `headers` `data` `with-credentials` `timeout` `uploader` `batch` `auto` `concurrency` `map-response` `before-remove` `layout` `variant` `preview` `downloadable` `reorderable` `placeholder` + the shared field props |
| events | `update:modelValue` `reject` `success` `error` `remove` |
| slots | `label` `meta` `drop` `file` |
| expose | `open()` `upload()` `retry(id)` `clear()` `files` |

Helpers: `parseBytes`, `formatBytes`, `matchesAccept`, `validateFile`, `kindOf` and `xhrUploader` are exported if you build your own.
