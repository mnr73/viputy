# ViUpload

ناحیه‌ی رها کردن، فهرست فایل، آپلود با پیشرفت، پیش‌نمایش و مرتب‌سازی در یک اینپوت. دو کار می‌کند: انتخاب فایل برای آپلود، و نمایش فایل‌هایی که روی سرور هستند (با مرتب‌سازی، دانلود و حذف).

<script setup>
import { ref } from "vue";
const one = ref([]);
const many = ref([]);
const saved = ref([
  { id: 1, name: "قرارداد-۱۴۰۵.pdf", size: 482113, url: "https://example.com/contract.pdf" },
  { id: 2, name: "عکس-سایت.png", size: 90211, type: "image/png", url: "data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%232563eb%27/%3E%3Ccircle cx=%27200%27 cy=%27130%27 r=%2760%27 fill=%27white%27/%3E%3C/svg%3E" },
  { id: 3, name: "لیست-قیمت.xlsx", size: 30210, url: "https://example.com/p.xlsx" },
  { id: 4, name: "archive.zip", size: 7341022, url: "https://example.com/a.zip" }
]);
const grid = ref([]);
const slow = (ms) => ({ files, progress, signal }) => new Promise((resolve, reject) => {
  let p = 0;
  const id = setInterval(() => { p += 0.08; progress(Math.min(p, 1)); if (p >= 1) { clearInterval(id); resolve({ url: URL.createObjectURL(files[0]) }); } }, ms);
  signal.addEventListener("abort", () => { clearInterval(id); reject(new DOMException("Aborted", "AbortError")); });
});
const failing = () => Promise.reject(new Error("سرور نپذیرفت (نمایشی)"));
const log = ref("");
</script>

<div class="demo">
  <ViUpload v-model="one" label="قرارداد (PDF تا ۱۰ مگابایت)" accept=".pdf" max-size="10MB" :uploader="slow(120)" />
  <ViUpload v-model="many" label="عکس‌ها (حداکثر ۵، هرکدام تا ۲ مگابایت)" multiple accept="image/*" max-size="2MB" :max-files="5" :uploader="slow(60)" reorderable layout="grid" @reject="log = $event.map(r => r.message).join(' / ')" />
  <ViUpload v-model="saved" label="فایل‌های ذخیره‌شده (مرتب‌سازی، دانلود، حذف)" multiple reorderable :uploader="slow(80)" />
  <ViUpload v-model="grid" label="ناموفق (نمایشی)" :uploader="failing" />
</div>

```vue
<script setup>
import { ref } from "vue";
const files = ref([]);
</script>

<template>
  <ViUpload
    v-model="files"
    label="قرارداد"
    accept=".pdf"
    max-size="10MB"
    url="/api/uploads"
    :headers="{ Authorization: `Bearer ${token}` }"
  />
</template>
```

## مقدار

`v-model` یک آرایه از فایل‌هاست، حتی در حالت تکی (صفر یا یک عضو). هر فایل:

```ts
interface UploadFile {
  id: string | number;   // برای فایل ذخیره‌شده مال خودت؛ برای فایل تازه ساخته می‌شود و با response.id عوض می‌شود
  name: string;
  size?: number;
  type?: string;
  url?: string;          // جای باز کردن، دانلود و پیش‌نمایش
  thumb?: string;        // عکس کوچک‌تر برای فهرست
  status?: "pending" | "uploading" | "done" | "error";
  error?: string;
  file?: File;           // فایل مرورگر (تا وقتی تازه است)
  response?: unknown;    // جواب سرور
}
```

فایل‌هایی که از سرور می‌آوری `file` و `status` ندارند و `done` حساب می‌شوند. بعد از آپلود، جایگاه فایل می‌ماند و `status: "done"` و `id` / `url` از جواب سرور می‌گیرد. فقط چیزی را که لازم داری ذخیره کن (`files.map(f => f.id)`).

## آپلود

| prop | |
|---|---|
| `url` | آپلود به این آدرس با POST چندبخشی |
| `method` | پیش‌فرض `POST` (`PUT` هم می‌شود) |
| `field-name` | نام فیلد فایل در فرم، پیش‌فرض `file`. در حالت دسته‌ای `file[]` |
| `headers` | آبجکت، یا تابعی که برای هر درخواست صدا می‌شود (توکنی که تمدید می‌شود) |
| `data` | فیلدهای اضافه‌ی فرم، آبجکت یا `(files) => object` |
| `with-credentials` | ارسال کوکی بین دامنه‌ها |
| `timeout` | میلی‌ثانیه |
| `uploader` | تابع خودت `({ files, signal, progress }) => Promise<response>`. جای `url` را می‌گیرد. برای S3، tus، تکه‌تکه... |
| `batch` | فایل‌های یک انتخاب را با هم در **یک** درخواست بفرست |
| `concurrency` | درخواست همزمان وقتی دسته‌ای نیست. پیش‌فرض ۳ |
| `auto` | آپلود بعد از انتخاب (پیش‌فرض). `false` دکمه‌ی **آپلود N فایل** نشان می‌دهد |
| `map-response` | `(response, files) => Partial<UploadFile>` برای خواندن `id` / `url` از هر جوابی |

بدون `url` و `uploader` چیزی فرستاده نمی‌شود: فایل‌ها در فهرست می‌مانند (`file` پر است) و خودت آن‌ها را می‌فرستی، مثلاً همراه بقیه‌ی فرم.

آپلودر داخلی `{ id, url }` را از جواب می‌خواند (`path` و `thumb` هم)؛ در حالت دسته‌ای آرایه‌ای به ترتیب فایل‌ها انتظار دارد. جواب 4xx/5xx پیام خود سرور را نشان می‌دهد: `errors` لاراول (اولین پیام) یا `message`.

```php
// لاراول: یک فایل
Route::post('/uploads', function (Request $r) {
    $r->validate(['file' => 'required|file|max:10240']);
    $path = $r->file('file')->store('uploads');
    return ['id' => Str::uuid(), 'url' => Storage::url($path)];
});
```

### پیشرفت

وقتی مرورگر فایل را می‌فرستد نوار و درصد نشان داده می‌شود. این فقط وقتی کار می‌کند که درخواست مرورگر پیشرفت گزارش کند (`xhr.upload.onprogress`)؛ اگر مرورگر کل حجم را نداند، نوار یک انیمیشن بدون درصد است (هیچ‌وقت عدد ساختگی نشان نمی‌دهد). در حالت `batch` یک درخواست همه‌ی فایل‌ها را می‌برد، پس پیشرفت درخواست بر اساس حجم بین فایل‌ها تقسیم می‌شود: اول فایل اول پر می‌شود. این یک تقریب است.

درصد، پیشرفت **ارسال** است. یک فایل بزرگ ممکن است روی ۱۰۰٪ بماند و سرور هنوز مشغول پردازش باشد؛ اگر لازم داری وضعیت خودت را با `status` نشان بده.

## اعتبارسنجی (قبل از ارسال)

| prop | |
|---|---|
| `accept` | `".pdf,.docx"`، `"image/*"` یا آرایه. انتخابگر فقط همین‌ها را نشان می‌دهد و فایل رهاشده هم بررسی می‌شود (پسوند باید آخر نام باشد: `a.pdf.exe` پی‌دی‌اف نیست) |
| `max-size` / `min-size` | بایت یا `"10MB"`، `"500KB"` (هر KB برابر ۱۰۲۴ بایت) |
| `max-files` | بیشترین تعداد فایل در فهرست (با `multiple`) |
| `name-pattern` | یک `RegExp` که نام فایل باید با آن بخواند |
| `max-name-length` | |
| `validate` | `(file) => string \| false \| void`: پیام (یا `false` برای پیام پیش‌فرض) برگردان تا فایل رد شود |

فایل‌های ردشده با دلیل و به زبان کاربر زیر ناحیه‌ی رها کردن می‌آیند و `@reject` آرایه‌ی `{ file, reason, message }` می‌دهد (`reason`: `type`، `size-max`، `size-min`، `name`، `name-length`، `count`، `custom`). بقیه‌ی فایل‌های همان انتخاب اضافه می‌شوند. بررسی سمت کلاینت برای راحتی کاربر است: سمت سرور هم حتماً اعتبارسنجی کن.

## پیش‌نمایش

عکس‌ها بندانگشتی دارند. روی بندانگشتی (عکس، PDF، ویدیو، صوت) بزنی نمایشگر باز می‌شود با قبلی / بعدی (کلیدهای جهت‌دار؛ در RTL فلش راست به عقب می‌رود). نمایشگر یک `<dialog>` بومی است: فوکوس را نگه می‌دارد، با Esc بسته می‌شود و فوکوس را برمی‌گرداند. فایلی که فقط انتخاب شده (هنوز `url` ندارد) از نسخه‌ی خود مرورگر پیش‌نمایش می‌شود، پس کاربر قبل از آپلود آن را می‌بیند. `preview="false"` خاموشش می‌کند و `thumb` عکس کوچک‌تر برای فهرست می‌دهد.

## مرتب‌سازی و حذف

- `reorderable`: دستگیره را بکش، یا فوکوس بده و با کلیدهای جهت‌دار جابه‌جا کن (Home / End به اول و آخر). جابه‌جایی برای screen readerها اعلام می‌شود. ترتیب جدید در `v-model` است.
- حذف فایلی که همین حالا آپلود می‌شود، درخواست را لغو می‌کند (فایل داخل `batch` کل دسته را لغو می‌کند). حذف فایل ذخیره‌شده فهرست جدید را emit می‌کند؛ `before-remove` می‌تواند اول از سرور بپرسد: `false` برگردان تا بماند.
- `readonly` فقط فهرست را نشان می‌دهد (دانلود و پیش‌نمایش کار می‌کند).

## چیدمان

`layout="grid"` کارت نشان می‌دهد و `variant="compact"` یک ناحیه‌ی تک‌خطی. اسلات `drop` داخل ناحیه را عوض می‌کند و اسلات `file` نام و حجم هر ردیف را.

## prop، رویداد، اسلات

| | |
|---|---|
| prop | `modelValue` `multiple` `accept` `max-size` `min-size` `max-files` `name-pattern` `max-name-length` `validate` `url` `method` `field-name` `headers` `data` `with-credentials` `timeout` `uploader` `batch` `auto` `concurrency` `map-response` `before-remove` `layout` `variant` `preview` `downloadable` `reorderable` `placeholder` + propهای مشترک فیلد |
| رویداد | `update:modelValue` `reject` `success` `error` `remove` |
| اسلات | `label` `meta` `drop` `file` |
| expose | `open()` `upload()` `retry(id)` `clear()` `files` |

توابع کمکی `parseBytes`، `formatBytes`، `matchesAccept`، `validateFile`، `kindOf` و `xhrUploader` برای ساخت اینپوت خودت export شده‌اند.
