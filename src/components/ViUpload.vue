<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from "vue";
import { digits } from "../date/format";
import { useViputy } from "../i18n/config";
import {
  UploadError,
  acceptList,
  describeAccept,
  extOf,
  formatBytes,
  kindOf,
  moveItem,
  parseBytes,
  serverMessage,
  splitProgress,
  validateFile,
  xhrUploader,
  type FileRules,
  type RejectReason,
  type Rejection,
  type UploadFile,
  type UploadStatus,
  type Uploader
} from "../utils/upload";
import { pickField, type FieldProps } from "./field-props";
import ViField from "./ViField.vue";
import { ViIcon } from "./ViIcon";
import { useValidation } from "../composables/useValidation";

defineOptions({ inheritAttrs: false });

type Id = string | number;
type Headers = Record<string, string>;

const props = withDefaults(
  defineProps<
    FieldProps & {
      /** The files: already uploaded ones (`url`) and new ones (`file`). */
      modelValue?: UploadFile[];
      multiple?: boolean;
      /** Like the native attribute: `".pdf,.docx"`, `"image/*"`, or an array. */
      accept?: string | string[];
      /** Bytes, or `"10MB"`. */
      maxSize?: number | string;
      minSize?: number | string;
      /** Most files in the list (multiple only). */
      maxFiles?: number;
      /** The file name must match. */
      namePattern?: RegExp;
      maxNameLength?: number;
      /** Your own rule: return a message (or `false`) to reject. */
      validate?: (file: File) => string | boolean | void;

      /** Upload here with a multipart POST. */
      url?: string;
      method?: string;
      /** Form field of the file. Default `"file"`. A batch sends `file[]`. */
      fieldName?: string;
      headers?: Headers | (() => Headers);
      /** Extra form fields. */
      data?:
        | Record<string, string | Blob>
        | ((files: File[]) => Record<string, string | Blob>);
      withCredentials?: boolean;
      timeout?: number;
      /** Your own upload function (any server, S3, tus...). Replaces `url`. */
      uploader?: Uploader;
      /** Send the files of one drop together in one request. */
      batch?: boolean;
      /** Start uploading as soon as files are added. `false` shows an Upload button. */
      auto?: boolean;
      /** Requests at the same time (not in a batch). */
      concurrency?: number;
      /** Turn the server's answer into fields of the file (`url`, `id`...). */
      mapResponse?: (
        response: unknown,
        files: UploadFile[]
      ) => Partial<UploadFile> | Array<Partial<UploadFile>> | void;
      /** Called before a file that is already on the server is removed; `false` keeps it. */
      beforeRemove?: (file: UploadFile) => boolean | Promise<boolean>;

      layout?: "list" | "grid";
      variant?: "dropzone" | "compact";
      /** Open images, PDFs, video and audio in a viewer. */
      preview?: boolean;
      downloadable?: boolean;
      /** Drag the handle (or use the arrow keys on it) to sort. */
      reorderable?: boolean;
      /** Replaces the drop zone's title. */
      placeholder?: string;
    }
  >(),
  {
    modelValue: () => [],
    multiple: false,
    batch: false,
    auto: true,
    concurrency: 3,
    layout: "list",
    variant: "dropzone",
    preview: true,
    downloadable: true,
    reorderable: false,
    status: null
  }
);

const emit = defineEmits<{
  "update:modelValue": [files: UploadFile[]];
  reject: [rejections: Rejection[]];
  success: [file: UploadFile];
  error: [file: UploadFile, error: unknown];
  remove: [file: UploadFile];
}>();
defineSlots<{
  label?(): unknown;
  meta?(): unknown;
  /** The inside of the drop zone. */
  drop?(p: { dragging: boolean }): unknown;
  /** The name and size of a file; the rest of the row stays. */
  file?(p: { file: UploadFile; status: UploadStatus }): unknown;
}>();

const attrs = useAttrs();
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }));
const { t, locale, dir } = useViputy();

// ---- the list (works controlled and uncontrolled)
const list = ref<UploadFile[]>([...(props.modelValue ?? [])]);
watch(
  () => props.modelValue,
  (v) => (list.value = [...(v ?? [])])
);
function commit(next: UploadFile[]) {
  list.value = next;
  emit("update:modelValue", next);
  queueMicrotask(val.onChange);
}
function patch(
  ids: Id[],
  fn: (f: UploadFile, i: number) => Partial<UploadFile>
) {
  commit(
    list.value.map((f) => {
      const i = ids.indexOf(f.id);
      return i < 0 ? f : { ...f, ...fn(f, i) };
    })
  );
}
let seq = 0;
const nextId = () => `vi-f-${Date.now().toString(36)}-${++seq}`;
const statusOf = (f: UploadFile): UploadStatus =>
  f.status ?? (f.file ? "pending" : "done");

// ---- rules
const tokens = computed(() => acceptList(props.accept));
const maxBytes = computed(() => parseBytes(props.maxSize));
const minBytes = computed(() => parseBytes(props.minSize));
const rules = computed<FileRules>(() => ({
  tokens: tokens.value,
  maxSize: maxBytes.value,
  minSize: minBytes.value,
  namePattern: props.namePattern,
  maxNameLength: props.maxNameLength
}));
const typeLabel = () =>
  describeAccept(
    tokens.value,
    {
      images: t("typeImages"),
      videos: t("typeVideos"),
      audio: t("typeAudio")
    },
    locale.value
  ) || tokens.value.join(", ");

function rejectMessage(reason: RejectReason, file: File, custom?: string) {
  const name = file.name;
  const size = (n?: number) => formatBytes(n ?? 0, locale.value);
  switch (reason) {
    case "type":
      return t("rejectType", { name, types: typeLabel() });
    case "size-max":
      return t("rejectMax", { name, size: size(maxBytes.value) });
    case "size-min":
      return t("rejectMin", { name, size: size(minBytes.value) });
    case "name":
      return t("rejectName", { name });
    case "name-length":
      return t("rejectNameLength", {
        name,
        n: digits(props.maxNameLength ?? 0, locale.value)
      });
    case "count":
      return t("rejectCount", {
        name,
        n: digits(limit.value ?? 1, locale.value)
      });
    default:
      return custom || t("rejectCustom", { name });
  }
}

const limit = computed(() => (props.multiple ? props.maxFiles : 1));
const full = computed(
  () => limit.value != null && list.value.length >= limit.value
);

// ---- adding files
const alerts = ref<Rejection[]>([]);
const live = ref("");

function addFiles(files: File[]) {
  if (!files.length || props.disabled || props.readonly) return;
  const rejected: Rejection[] = [];
  const accepted: File[] = [];
  let room = props.multiple
    ? limit.value == null
      ? Infinity
      : limit.value - list.value.length
    : 1;
  const reject = (file: File, reason: RejectReason, custom?: string) =>
    rejected.push({
      file,
      reason,
      message: rejectMessage(reason, file, custom)
    });
  for (const file of files) {
    const broken = validateFile(file, rules.value);
    if (broken) {
      reject(file, broken);
      continue;
    }
    const mine = props.validate?.(file);
    if (typeof mine === "string" || mine === false) {
      reject(file, "custom", typeof mine === "string" ? mine : undefined);
      continue;
    }
    if (accepted.length >= room) {
      reject(file, "count");
      continue;
    }
    accepted.push(file);
  }
  alerts.value = rejected;
  if (rejected.length) emit("reject", rejected);
  if (!accepted.length) return;

  const added: UploadFile[] = accepted.map((file) => ({
    id: nextId(),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
    status: "pending"
  }));
  if (!props.multiple) dropAll();
  commit(props.multiple ? [...list.value, ...added] : added);
  if (uploader.value && props.auto) start(added.map((f) => f.id));
}

function dropAll() {
  for (const j of new Set(jobs.values())) j.ctrl.abort();
  jobs.clear();
}

// ---- picking and dropping
const inputEl = ref<HTMLInputElement>();
const dragging = ref(false);
let depth = 0;
const hasFiles = (e: DragEvent) =>
  Array.from(e.dataTransfer?.types ?? []).includes("Files");
function openPicker() {
  if (props.disabled || props.readonly || full.value) return;
  inputEl.value?.click();
}
function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  addFiles(Array.from(el.files ?? []));
  el.value = ""; // the same file can be picked again
}
function onDragEnter(e: DragEvent) {
  if (!hasFiles(e) || props.disabled) return;
  depth++;
  dragging.value = true;
}
function onDragOver(e: DragEvent) {
  if (!hasFiles(e)) return;
  e.preventDefault();
  if (e.dataTransfer)
    e.dataTransfer.dropEffect = props.disabled ? "none" : "copy";
}
function onDragLeave() {
  depth = Math.max(0, depth - 1);
  if (!depth) dragging.value = false;
}
function onDrop(e: DragEvent) {
  if (!hasFiles(e)) return;
  e.preventDefault();
  depth = 0;
  dragging.value = false;
  addFiles(Array.from(e.dataTransfer?.files ?? []));
}

// ---- uploading
const uploader = computed<Uploader | null>(
  () =>
    props.uploader ??
    (props.url
      ? xhrUploader({
          url: props.url,
          method: props.method,
          fieldName: props.fieldName,
          batch: props.batch,
          headers: props.headers,
          data: props.data,
          withCredentials: props.withCredentials,
          timeout: props.timeout
        })
      : null)
);
const manual = computed(() => !!uploader.value && !props.auto);
const pending = computed(() =>
  list.value.filter((f) => f.file && statusOf(f) === "pending")
);

/** 0..1 per file, `null` = the server gave no progress. Only while uploading. */
const progress = ref<Record<string, number | null>>({});
const jobs = new Map<Id, { ctrl: AbortController; ids: Id[] }>();
const queue: Id[][] = [];
let running = 0;
let dead = false;

function start(ids: Id[]) {
  if (!uploader.value) return;
  queue.push(...(props.batch ? [ids] : ids.map((id) => [id])));
  pump();
}
function pump() {
  while (running < Math.max(1, props.concurrency) && queue.length) {
    const group = queue.shift()!;
    running++;
    run(group).finally(() => {
      running--;
      pump();
    });
  }
}
function upload() {
  start(pending.value.map((f) => f.id));
}
function retry(id: Id) {
  patch([id], () => ({ status: "pending", error: undefined }));
  start([id]);
}

function errorText(e: unknown): string {
  if (e instanceof UploadError) {
    if (e.code === "network") return t("uploadNetwork");
    return (
      e.message ||
      `${t("uploadFailed")} (${digits(e.status ?? 0, locale.value)})`
    );
  }
  return (e as Error)?.message || t("uploadFailed");
}
const pickKeys = (r: unknown): Partial<UploadFile> => {
  if (!r || typeof r !== "object") return {};
  const o = r as Record<string, unknown>;
  const out: Partial<UploadFile> = {};
  if (typeof o.id === "string" || typeof o.id === "number") out.id = o.id;
  const url = o.url ?? o.path;
  if (typeof url === "string") out.url = url;
  if (typeof o.thumb === "string") out.thumb = o.thumb;
  return out;
};
function mapped(res: unknown, files: UploadFile[]): Partial<UploadFile>[] {
  const custom = props.mapResponse?.(res, files);
  if (custom !== undefined) {
    const arr = Array.isArray(custom) ? custom : files.map(() => custom);
    return files.map((_, i) => arr[i] ?? {});
  }
  if (files.length > 1)
    return files.map((_, i) =>
      pickKeys(Array.isArray(res) ? res[i] : undefined)
    );
  return [pickKeys(Array.isArray(res) ? res[0] : res)];
}

async function run(ids: Id[]) {
  const files = ids
    .map((id) => list.value.find((f) => f.id === id))
    .filter((f): f is UploadFile => !!f?.file && statusOf(f) !== "done");
  if (!files.length || dead) return;
  const keys = files.map((f) => f.id);
  const ctrl = new AbortController();
  for (const id of keys) jobs.set(id, { ctrl, ids: keys });
  for (const id of keys) progress.value[String(id)] = 0;
  patch(keys, () => ({ status: "uploading", error: undefined }));
  const sizes = files.map((f) => f.file!.size);
  try {
    const res = await uploader.value!({
      files: files.map((f) => f.file!),
      signal: ctrl.signal,
      progress: (fr) => {
        if (fr == null)
          keys.forEach((id) => (progress.value[String(id)] = null));
        else
          splitProgress(sizes, fr).forEach(
            (p, i) => (progress.value[String(keys[i]!)] = p)
          );
      }
    });
    if (dead || ctrl.signal.aborted) return;
    const extra = mapped(res, files);
    patch(keys, (f, i) => ({
      status: "done",
      error: undefined,
      response: res,
      ...extra[i]
    }));
    for (const f of files) {
      const now = list.value.find(
        (x) => x.name === f.name && x.file === f.file
      );
      if (now) emit("success", now);
    }
  } catch (e) {
    if (dead || ctrl.signal.aborted || (e as Error)?.name === "AbortError")
      return;
    patch(keys, () => ({ status: "error", error: errorText(e) }));
    for (const f of files) emit("error", { ...f, status: "error" }, e);
  } finally {
    for (const id of keys) {
      jobs.delete(id);
      delete progress.value[String(id)];
    }
  }
}

// ---- remove / cancel
const busy = ref<Set<Id>>(new Set());
async function remove(f: UploadFile) {
  if (props.disabled || props.readonly || busy.value.has(f.id)) return;
  const job = jobs.get(f.id);
  let ids: Id[] = [f.id];
  if (job) {
    // a batch is one request: cancelling it drops every file in it
    job.ctrl.abort();
    ids = job.ids;
    for (const id of ids) jobs.delete(id);
  } else if (!f.file && props.beforeRemove) {
    busy.value = new Set(busy.value).add(f.id);
    try {
      if ((await props.beforeRemove(f)) === false) return;
    } finally {
      const b = new Set(busy.value);
      b.delete(f.id);
      busy.value = b;
    }
  }
  const gone = list.value.filter((x) => ids.includes(x.id));
  commit(list.value.filter((x) => !ids.includes(x.id)));
  for (const g of gone) emit("remove", g);
}
function clear() {
  dropAll();
  commit([]);
}

// ---- object URLs for files that are only in the browser
const blobs = new Map<Id, string>();
const canBlob = (f: UploadFile) =>
  !!f.file &&
  typeof URL !== "undefined" &&
  typeof URL.createObjectURL === "function";
function srcOf(f: UploadFile): string | undefined {
  if (f.url) return f.url;
  if (!canBlob(f)) return undefined;
  let u = blobs.get(f.id);
  if (!u) blobs.set(f.id, (u = URL.createObjectURL(f.file!)));
  return u;
}
const thumbOf = (f: UploadFile) => f.thumb ?? srcOf(f);
watch(
  list,
  (l) => {
    for (const [id, u] of blobs)
      if (!l.some((f) => f.id === id)) {
        URL.revokeObjectURL(u);
        blobs.delete(id);
      }
  },
  { flush: "post" }
);

// ---- the viewer
const previewKinds = new Set(["image", "pdf", "video", "audio"]);
const canPreview = (f: UploadFile) =>
  props.preview && previewKinds.has(kindOf(f)) && !!srcOf(f);
const previews = computed(() => list.value.filter(canPreview));
const viewing = ref<Id | null>(null);
const viewIndex = computed(() =>
  previews.value.findIndex((f) => f.id === viewing.value)
);
const current = computed(() => previews.value[viewIndex.value] ?? null);
function setDialog(el: unknown) {
  const d = el as HTMLDialogElement | null;
  if (d && !d.open && typeof d.showModal === "function") d.showModal();
}
function go(delta: number) {
  const n = previews.value.length;
  if (n < 2) return;
  viewing.value = previews.value[(viewIndex.value + delta + n) % n]!.id;
}
function onViewKey(e: KeyboardEvent) {
  const k = e.key;
  if (k !== "ArrowLeft" && k !== "ArrowRight") return;
  e.preventDefault();
  const forward = (k === "ArrowRight") === (dir.value === "ltr");
  go(forward ? 1 : -1);
}
function onDialogClick(e: MouseEvent) {
  if (e.target === e.currentTarget) viewing.value = null;
}

// ---- sorting
const rows = new Map<Id, HTMLElement>();
const setRow = (id: Id, el: unknown) =>
  el ? rows.set(id, el as HTMLElement) : rows.delete(id);
const dragId = ref<Id | null>(null);
function say(f: UploadFile, to: number) {
  live.value = t("movedTo", {
    name: f.name,
    n: digits(to + 1, locale.value),
    total: digits(list.value.length, locale.value)
  });
}
function move(from: number, to: number) {
  if (from === to || to < 0 || to >= list.value.length) return;
  const f = list.value[from]!;
  commit(moveItem(list.value, from, to));
  say(f, to);
}
function gripDown(e: PointerEvent, f: UploadFile) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  dragId.value = f.id;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
}
function gripMove(e: PointerEvent) {
  if (dragId.value == null) return;
  for (const [id, el] of rows) {
    if (id === dragId.value) continue;
    const r = el.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right) continue;
    if (e.clientY < r.top || e.clientY > r.bottom) continue;
    const from = list.value.findIndex((x) => x.id === dragId.value);
    move(
      from,
      list.value.findIndex((x) => x.id === id)
    );
    break;
  }
}
const gripUp = () => (dragId.value = null);
function gripKey(e: KeyboardEvent, f: UploadFile, i: number) {
  const grid = props.layout === "grid";
  const horizontal = e.key === "ArrowLeft" || e.key === "ArrowRight";
  if (horizontal && !grid) return;
  let to = i;
  if (e.key === "ArrowUp") to = i - 1;
  else if (e.key === "ArrowDown") to = i + 1;
  else if (horizontal)
    to = i + ((e.key === "ArrowRight") === (dir.value === "ltr") ? 1 : -1);
  else if (e.key === "Home") to = 0;
  else if (e.key === "End") to = list.value.length - 1;
  else return;
  e.preventDefault();
  move(i, Math.max(0, Math.min(to, list.value.length - 1)));
  nextTick(() =>
    rows.get(f.id)?.querySelector<HTMLElement>(".vi-upload__grip")?.focus()
  );
}

// ---- text
const hint = computed(() => {
  const parts: string[] = [];
  if (tokens.value.length) parts.push(typeLabel());
  if (maxBytes.value != null)
    parts.push(t("upTo", { size: formatBytes(maxBytes.value, locale.value) }));
  if (props.multiple && props.maxFiles != null)
    parts.push(t("maxFilesN", { n: digits(props.maxFiles, locale.value) }));
  return parts.join(" · ");
});
const title = computed(
  () => props.placeholder ?? t(props.multiple ? "dropFiles" : "dropFile")
);
const percent = computed(
  () => new Intl.NumberFormat(locale.value, { style: "percent" })
);
const pct = (f: UploadFile) => {
  const p = progress.value[String(f.id)];
  return p == null ? "" : percent.value.format(p);
};
const badge = (f: UploadFile) =>
  (extOf(f.name) || "file").slice(0, 4).toUpperCase();
const sizeText = (f: UploadFile) =>
  f.size == null ? "" : formatBytes(f.size, locale.value);

const val = useValidation({
  value: () => list.value,
  rules: () => props.rules,
  messages: () => props.messages,
  label: () => props.label,
  name: () =>
    String(attrs.name ?? (props as { name?: string }).name ?? "") || undefined,
  validateOn: () => props.validateOn,
  focus: () => openPicker(),
  el: () => inputEl.value ?? null
});
const fieldProps = computed(() => ({
  ...pickField(props, { root: "vi-upload-field" }, val.error.value),
  bare: true
}));

onBeforeUnmount(() => {
  dead = true;
  dropAll();
  for (const u of blobs.values()) URL.revokeObjectURL(u);
  blobs.clear();
});

defineExpose({ open: openPicker, upload, retry, clear, files: list });
</script>

<template>
  <ViField v-bind="{ ...fieldProps, ...rootAttrs }">
    <template #label
      ><slot name="label">{{ props.label }}</slot></template
    >
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template #default="{ id }">
      <div
        class="vi-upload"
        :data-layout="props.layout"
        :data-variant="props.variant"
        :data-dragging="dragging || undefined"
        :data-disabled="props.disabled || undefined"
      >
        <input
          :id="id"
          ref="inputEl"
          class="vi-upload__input"
          type="file"
          tabindex="-1"
          :accept="tokens.join(',') || undefined"
          :multiple="props.multiple"
          :disabled="props.disabled || props.readonly || undefined"
          @change="onPick"
        />
        <div
          v-if="!props.readonly && !full"
          class="vi-upload__zone"
          role="button"
          :tabindex="props.disabled ? -1 : 0"
          :aria-disabled="props.disabled || undefined"
          :aria-controls="id"
          @click="openPicker"
          @blur="val.onBlur"
          @keydown.enter.prevent="openPicker"
          @keydown.space.prevent="openPicker"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <slot name="drop" :dragging="dragging">
            <ViIcon name="upload" :size="26" :width="2" />
            <span class="vi-upload__title">{{ title }}</span>
            <span class="vi-upload__hint">
              {{ t("or") }}
              <span class="vi-upload__link">{{ t("chooseFromDevice") }}</span>
              <template v-if="hint"> · {{ hint }}</template>
            </span>
          </slot>
        </div>

        <div v-if="alerts.length" class="vi-upload__alerts" role="alert">
          <div v-for="(a, i) in alerts" :key="i" class="vi-upload__alert">
            <ViIcon name="alert" :size="15" :width="2" />
            <span dir="auto">{{ a.message }}</span>
          </div>
          <div class="vi-upload__alerts-x">
            <button
              type="button"
              class="vi-icon-btn"
              :aria-label="t('close')"
              @click="alerts = []"
            >
              <ViIcon name="close" :size="12" :width="3" />
            </button>
          </div>
        </div>

        <div v-if="list.length" class="vi-upload__list" role="list">
          <div
            v-for="(f, i) in list"
            :key="f.id"
            :ref="(el) => setRow(f.id, el)"
            class="vi-upload__item"
            role="listitem"
            :data-status="statusOf(f)"
            :data-kind="kindOf(f)"
            :data-dragging="dragId === f.id || undefined"
          >
            <button
              v-if="props.reorderable && !props.readonly && list.length > 1"
              type="button"
              class="vi-icon-btn vi-upload__grip"
              :disabled="props.disabled"
              :aria-label="t('reorderFile', { name: f.name })"
              @pointerdown="gripDown($event, f)"
              @pointermove="gripMove"
              @pointerup="gripUp"
              @pointercancel="gripUp"
              @keydown="gripKey($event, f, i)"
            >
              <ViIcon name="grip" :size="18" :width="3" />
            </button>
            <button
              v-if="canPreview(f)"
              type="button"
              class="vi-upload__thumb"
              :aria-label="`${t('preview')}: ${f.name}`"
              @click="viewing = f.id"
            >
              <img
                v-if="kindOf(f) === 'image' && thumbOf(f)"
                :src="thumbOf(f)"
                alt=""
                loading="lazy"
              />
              <span v-else class="vi-upload__badge">{{ badge(f) }}</span>
            </button>
            <span v-else class="vi-upload__thumb">
              <img
                v-if="kindOf(f) === 'image' && thumbOf(f)"
                :src="thumbOf(f)"
                alt=""
                loading="lazy"
              />
              <span v-else class="vi-upload__badge">{{ badge(f) }}</span>
            </span>

            <div class="vi-upload__info">
              <slot name="file" :file="f" :status="statusOf(f)">
                <div class="vi-upload__line">
                  <span class="vi-upload__name" dir="auto" :title="f.name">{{
                    f.name
                  }}</span>
                  <span
                    v-if="statusOf(f) === 'uploading'"
                    class="vi-upload__pct"
                    >{{ pct(f) }}</span
                  >
                </div>
              </slot>
              <div
                v-if="statusOf(f) === 'uploading'"
                class="vi-upload__bar"
                role="progressbar"
                :aria-label="f.name"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="
                  progress[String(f.id)] == null
                    ? undefined
                    : Math.round((progress[String(f.id)] ?? 0) * 100)
                "
                :data-indeterminate="
                  progress[String(f.id)] == null || undefined
                "
              >
                <span
                  :style="{ width: `${(progress[String(f.id)] ?? 0) * 100}%` }"
                />
              </div>
              <div v-else class="vi-upload__meta">
                <span v-if="statusOf(f) === 'error'" class="vi-upload__err">
                  <ViIcon name="alert" :size="14" :width="2" />
                  <span dir="auto">{{ f.error }}</span>
                </span>
                <span v-else>{{ sizeText(f) }}</span>
              </div>
            </div>

            <div class="vi-upload__actions">
              <button
                v-if="statusOf(f) === 'error' && uploader && f.file"
                type="button"
                class="vi-icon-btn"
                :aria-label="`${t('retry')}: ${f.name}`"
                @click="retry(f.id)"
              >
                <ViIcon name="retry" :size="16" :width="2.5" />
              </button>
              <a
                v-if="props.downloadable && statusOf(f) === 'done' && srcOf(f)"
                class="vi-icon-btn"
                :href="srcOf(f)"
                :download="f.name"
                target="_blank"
                rel="noopener"
                :aria-label="`${t('download')}: ${f.name}`"
              >
                <ViIcon name="download" :size="16" :width="2.5" />
              </a>
              <button
                v-if="!props.readonly"
                type="button"
                class="vi-icon-btn"
                :disabled="props.disabled || busy.has(f.id)"
                :aria-label="`${statusOf(f) === 'uploading' ? t('cancelUpload') : t('remove')}: ${f.name}`"
                @click="remove(f)"
              >
                <ViIcon
                  :name="statusOf(f) === 'uploading' ? 'close' : 'trash'"
                  :size="statusOf(f) === 'uploading' ? 14 : 16"
                  :width="2.5"
                />
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="manual && pending.length"
          type="button"
          class="vi-btn vi-btn--sm vi-btn--primary vi-upload__send"
          :disabled="props.disabled"
          @click="upload"
        >
          {{ t("uploadN", { n: digits(pending.length, locale) }) }}
        </button>
        <span class="vi-upload__sr" aria-live="polite">{{ live }}</span>
      </div>
    </template>
  </ViField>

  <dialog
    v-if="current"
    :ref="setDialog"
    class="vi-upload__view"
    :aria-label="current.name"
    :dir="dir"
    @close="viewing = null"
    @click="onDialogClick"
    @keydown="onViewKey"
  >
    <div class="vi-upload__viewbox">
      <div class="vi-upload__viewhead">
        <span class="vi-upload__viewname" dir="auto">{{ current.name }}</span>
        <span v-if="previews.length > 1" class="vi-upload__viewcount">
          {{ digits(viewIndex + 1, locale) }} /
          {{ digits(previews.length, locale) }}
        </span>
        <a
          v-if="props.downloadable && srcOf(current)"
          class="vi-upload__viewbtn"
          :href="srcOf(current)"
          :download="current.name"
          target="_blank"
          rel="noopener"
          :aria-label="t('download')"
        >
          <ViIcon name="download" :size="18" :width="2.5" />
        </a>
        <button
          type="button"
          class="vi-upload__viewbtn"
          :aria-label="t('close')"
          @click="viewing = null"
        >
          <ViIcon name="close" :size="16" :width="3" />
        </button>
      </div>
      <div class="vi-upload__stage">
        <button
          v-if="previews.length > 1"
          type="button"
          class="vi-upload__nav vi-upload__nav--prev"
          :aria-label="t('prevFile')"
          @click="go(-1)"
        >
          <ViIcon name="chevron" :size="22" :width="2.5" />
        </button>
        <img
          v-if="kindOf(current) === 'image'"
          :src="srcOf(current)"
          :alt="current.name"
        />
        <iframe
          v-else-if="kindOf(current) === 'pdf'"
          :src="srcOf(current)"
          :title="current.name"
        />
        <video
          v-else-if="kindOf(current) === 'video'"
          :src="srcOf(current)"
          controls
        />
        <audio v-else :src="srcOf(current)" controls />
        <button
          v-if="previews.length > 1"
          type="button"
          class="vi-upload__nav vi-upload__nav--next"
          :aria-label="t('nextFile')"
          @click="go(1)"
        >
          <ViIcon name="chevron" :size="22" :width="2.5" />
        </button>
      </div>
    </div>
  </dialog>
</template>
