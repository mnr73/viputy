# Components: props, events, slots

Generated from `src/components/*.vue` (`defineProps` / `defineEmits` / `defineSlots` / `defineExpose`). Types are the TypeScript types in the source. `Shared` = `label hint message status required disabled readonly bare id ui` (every `ViField`-based input). If a prop seems missing, read the component: the source wins.


## ViField

The frame: label, control box, hint/message. Everything below is built on it. Slots: `label`, `meta` (right of the label), `before`, default (receives `{ id }`), `after`. Expose: `control` (the frame element, use it as a popup anchor).

| prop | type | notes |
|---|---|---|
| `label` | `string` |  |
| `hint` | `string` |  |
| `message` | `string` | Validation text; shown instead of `hint` and coloured by `status`. |
| `status` | `FieldStatus` |  |
| `required` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readonly` | `boolean` |  |
| `bare` | `boolean` | Drop the frame (border, background, padding). |
| `active` | `boolean` | Force the open/focused look (for popup-based inputs). |
| `id` | `string` |  |
| `ui` | `Partial<Record<Part, string>>` | Extra class per part. |

Events: `controlClick`.

Expose: `control`.


## ViPopup

Smart panel: opens below, flips above when there is no room, clamps horizontally, becomes a bottom sheet under `breakpoint` (640). Teleported to `<body>`; copies tokens, dark mode and direction from the trigger. Use `#trigger` or pass `:anchor`. Footer slot is pinned in the sheet.

| prop | type | notes |
|---|---|---|
| `modelValue` | `boolean` |  |
| `anchor` | `HTMLElement \| null` | Element to position against. Defaults to the trigger slot wrapper. |
| `side` | `Side` |  |
| `align` | `Align` |  |
| `offset` | `number` |  |
| `matchWidth` | `boolean` | Make the panel as wide as the anchor. |
| `mobile` | `"sheet" \| "fullscreen" \| false` | Narrow screens: bottom sheet, full screen, or keep the popover. |
| `breakpoint` | `number` | Max viewport width (px) that counts as narrow. |
| `title` | `string` | Title shown in the sheet header. |
| `closeOnOutside` | `boolean` |  |
| `closeOnEscape` | `boolean` | Escape closes the panel (default). Turn off when the owner handles Escape itself. |
| `autoScroll` | `boolean` | When the panel fits neither above nor below, scroll the page a little so it fits (default). `false` never moves the page; the panel then scrolls inside itself. |
| `restoreFocus` | `boolean` | Return focus to the element that had it when the panel closes (default). Turn off for combobox-style inputs whose own focus state opens the panel, or closing re-opens it. |
| `teleport` | `boolean` | Render the panel in <body> (default) so it is never clipped. |
| `role` | `string` |  |

Events: `update:modelValue`, `open`, `close`.

Slots: `trigger`, `default`, `footer`.

Expose: `open`, `close`, `toggle`, `panel`, `isSheet`.


## ViInput

`type="number"` gives a real `number` (or `null`). Persian/Arabic digits are accepted; `grouped` and `persian-digits` only change display. Other attributes go to the native `<input>`.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| number \| null` |  |
| `type` | `"text" \| "password" \| "email" \| "tel" \| "url" \| "search" \| "number"` |  |
| `placeholder` | `string` |  |
| `clearable` | `boolean` | Show a clear button on hover/focus. |
| `prefix` | `string` | Static text before/after the value (e.g. a currency). |
| `suffix` | `string` |  |
| `decimals` | `number` | number: max fraction digits (0 = integers only). |
| `min` | `number` |  |
| `max` | `number` |  |
| `grouped` | `boolean` | number: thousands separators. |
| `persianDigits` | `boolean` | number: show Persian digits and separators. |
| `fixLetters` | `boolean` | text: convert Arabic ي/ك to Persian ی/ک while typing. |
| `suggestions` | `Array<string \| number>` | Value suggestions via the native datalist. |
| `dir` | `"ltr" \| "rtl" \| "auto"` | Text direction of the input; email/url/tel/password/number default to ltr. |

Events: `update:modelValue`.

Slots: `before`, `after`, `label`, `meta`.

Expose: `focus`, `blur`, `el`.


## ViText

Textarea. `maxlength` is a soft limit (counter turns red); add `strict` to also block typing.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| null` |  |
| `placeholder` | `string` |  |
| `rows` | `number` |  |
| `maxlength` | `number` | Soft limit: shows a counter and turns red past it. |
| `strict` | `boolean` | Also block typing past `maxlength` natively. |
| `counter` | `boolean` | Counter visibility; defaults to on when `maxlength` is set. |
| `autosize` | `boolean` | Grow with the content (modern browsers; others keep `rows`). |
| `resize` | `"none" \| "vertical"` |  |
| `fixLetters` | `boolean` |  |
| `dir` | `"ltr" \| "rtl" \| "auto"` |  |

Events: `update:modelValue`.

Slots: `label`, `meta`.

Expose: `focus`, `el`.


## ViSelect

Single or `multiple`. Options: strings, `{ label, value }` objects (accessors via `option-label` etc.) or groups `{ label, options }` (a group click selects all its options in `multiple`). Searchable by default above 7 options; search normalises Arabic/Persian letters. `filter=false` + `@search` = server-side search. List scrolls inside `list-max-height` (default 320).

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `any` | Single: one value. Multiple: an array. |
| `options` | `any[]` | Strings, objects, or groups: `{ label, options: [...] }`. |
| `multiple` | `boolean` |  |
| `placeholder` | `string` |  |
| `searchable` | `boolean` | Search box in the panel. Default: on when there are more than 7 options. |
| `searchPlaceholder` | `string` |  |
| `filter` | `boolean \| FilterFn` | `false` turns local filtering off (do server-side search with `@search`). |
| `clearable` | `boolean` |  |
| `by` | `string \| ((value: any) => any)` | Compare object values by this key (or function) instead of identity. |
| `optionLabel` | `Accessor` |  |
| `optionValue` | `Accessor` |  |
| `optionDisabled` | `Accessor` |  |
| `optionDescription` | `Accessor` |  |
| `optionGroup` | `string` | Key holding a group's options. Default `"options"`. |
| `display` | `"chips" \| "count"` | multiple: show chips or just a count. |
| `maxChips` | `number` | multiple + chips: collapse the rest into "+n". |
| `actions` | `boolean` | multiple: "select all / clear" row. |
| `loading` | `boolean` |  |
| `listMaxHeight` | `number \| string` | Popover only: the option list scrolls inside this height (px or CSS length). `none` removes the cap. Default 320. |
| `name` | `string` | Adds hidden inputs so a native <form> submits the value. |
| `mobile` | `"sheet" \| "fullscreen" \| false` | Narrow screens: bottom sheet, full screen, or keep the popover. |
| `autoScroll` | `boolean` | Scroll the page a little when the panel fits neither above nor below (default). |
| `closeOnSelect` | `boolean` | Close after picking (default: single only). |

Events: `update:modelValue`, `search`, `open`, `close`.

Slots: `label`, `meta`, `before`, `value`, `option`, `empty`.

Expose: `focus`, `open`, `close`.


## ViTag

Free tags. Separators `, ،` and Enter commit; paste splits. `hide-tags` shows a count chip that opens a removable list. Pass `:restore-focus=false` is already done internally.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string[]` |  |
| `placeholder` | `string` |  |
| `suggestions` | `string[]` | Values offered while typing. |
| `max` | `number` | Maximum number of tags; shows a counter. |
| `allowCustom` | `boolean` | Allow values that are not in `suggestions`. |
| `allowDuplicates` | `boolean` |  |
| `separators` | `string[]` | Typed characters that commit a tag (Enter always does). |
| `hideTags` | `boolean` | Hide the chips and show only a count. |
| `dir` | `"ltr" \| "rtl" \| "auto"` |  |

Events: `update:modelValue`, `add`, `remove`.

Slots: `label`, `meta`, `tag`.

Expose: `focus`, `el`.


## ViDate

One date, optionally with time (`time="hm"|"hms"`). Value is ISO Gregorian. `calendars=["jalali","gregorian"]` adds a switch. Typing accepts `1405/8/19`, `2026-11-10`, Persian digits; the 4-digit year picks the calendar (<1700 = Jalali).

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| null` | ISO: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm[:ss]` when `time` is on. |
| `calendars` | `CalendarId[]` | Calendars the user can switch between. A single value hides the switch. |
| `calendar` | `CalendarId` | Starting calendar. Default: first of `calendars`. |
| `time` | `false \| "hm" \| "hms"` | Also pick a time: `"hm"` or `"hms"`. |
| `hour12` | `boolean` |  |
| `minuteStep` | `number` |  |
| `min` | `string` | ISO bounds. A date-only `max` includes that whole day. |
| `max` | `string` |  |
| `isDisabled` | `(iso: string) => boolean` |  |
| `marked` | `string[]` | Days to outline (ISO). |
| `months` | `number` | Months side by side (1 or 2). |
| `placeholder` | `string` |  |
| `clearable` | `boolean` |  |
| `displayFormat` | `string` | Output pattern for the closed field. Default depends on `time`. |
| `mobile` | `"sheet" \| "fullscreen" \| false` | Narrow screens: bottom sheet, full screen, or keep the popover. |
| `autoScroll` | `boolean` | Scroll the page a little when the panel fits neither above nor below (default). |
| `name` | `string` | Adds a hidden input with the ISO value for native forms. |
| `weekStart` | `number` |  |
| `weekend` | `number[]` |  |

Events: `update:modelValue`, `open`, `close`.

Slots: `label`, `meta`, `before`.

Expose: `focus`, `open`, `close`.



Every phone date sheet (`ViDate` with or without `time`, `ViDateRange`) has the same footer: row 1 is the value (`ViDate` with a time: two buttons, date + value and time + value, that act as tabs; otherwise a plain value box), row 2 is the calendar switch, the secondary button and the primary button (Confirm / Apply) on the physical right. For `ViDate` with `time` the footer shows two buttons side by side (date + value, time + value) that act as tabs; picking a day moves to the time automatically; a new open starts on the date. Date-only fields and desktop popovers are unchanged. Only `ViDate` does this (`ViDateRange` has no time).

## ViTime

Time only. Value `HH:mm` or `HH:mm:ss` (24 h, ASCII) whatever `hour12` shows.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| null` | `HH:mm` or `HH:mm:ss` (24-hour, ASCII) - the same on the wire whatever is displayed. |
| `seconds` | `boolean` |  |
| `hour12` | `boolean` |  |
| `minuteStep` | `number` |  |
| `min` | `string` | `HH:mm[:ss]` bounds. |
| `max` | `string` |  |
| `placeholder` | `string` |  |
| `clearable` | `boolean` |  |
| `mobile` | `"sheet" \| "fullscreen" \| false` |  |
| `autoScroll` | `boolean` | Scroll the page a little when the panel fits neither above nor below (default). |
| `name` | `string` |  |

Events: `update:modelValue`.

Slots: `label`, `meta`.

Expose: `focus`.


## ViTimeZone

Picks an IANA time zone. A `ViSelect` underneath: every `ViSelect` prop (label, clearable, mobile, disabled, ...) and `ViField` prop passes through. Value is the id (`"Asia/Tehran"`), never an offset.

| prop | type | default | |
|---|---|---|---|
| `modelValue` | `string \| null` | | IANA id |
| `at` | `string \| Date` | now | moment whose UTC offsets are shown (daylight saving) |
| `zones` | `string[]` | all the browser knows + `UTC` | limit the list |

Emits `update:modelValue`. A value missing from the browser's list (`Asia/Kolkata` vs `Asia/Calcutta`) is still listed. Search matches the localised name, the id with spaces (`new york`) and the offset (`+03:30`). Cities have no Persian names in `Intl`, so Persian search finds only zones with a Persian name (`ایران`, `بریتانیا`), not city names.

Helpers: `detectTimeZone()` (browser zone or `null`, client only), `formatOffset(210)` = `"UTC+03:30"`, `timeZoneOptions(locale, at?, zones?, include?)`.

## ViDateRange

`{ start, end }` ISO days. First click = start (popup stays), second = end (sorted). Presets (`today yesterday last7 last30 thisMonth lastMonth`) are calendar-aware (this month in Jalali = 1 to 30 Aban). `max-days` clamps.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `RangeValue \| null` | `{ start, end }` as ISO dates (`YYYY-MM-DD`). Either may be null. |
| `calendars` | `CalendarId[]` |  |
| `calendar` | `CalendarId` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `isDisabled` | `(iso: string) => boolean` |  |
| `marked` | `string[]` |  |
| `months` | `number` | Months side by side (default 2 on wide screens). |
| `presets` | `boolean \| PresetKey[]` | Quick ranges shown beside the calendar: `true` for all, or a list. `false` hides them. |
| `maxDays` | `number` | Longest range allowed, in days. |
| `allowSameDay` | `boolean` | Allow start and end to be the same day. Default true. |
| `showCount` | `boolean` | Show the number of days in the footer. |
| `placeholder` | `string` |  |
| `clearable` | `boolean` |  |
| `mobile` | `"sheet" \| "fullscreen" \| false` |  |
| `autoScroll` | `boolean` | Scroll the page a little when the panel fits neither above nor below (default). |
| `name` | `string` | Hidden inputs `name[start]` / `name[end]` for native forms. |
| `weekStart` | `number` |  |
| `weekend` | `number[]` |  |

Events: `update:modelValue`, `open`, `close`.

Slots: `label`, `meta`.

Expose: `focus`, `open`, `close`.


## ViSimpleDate

Three selects (day/month/year). Emits only when all three are chosen; clamps the day when the month is shorter. `shortcuts` adds first/last of month.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| null` | ISO `YYYY-MM-DD`. Empty until the user has picked year, month and day. |
| `calendar` | `CalendarId` |  |
| `min` | `string` |  |
| `max` | `string` |  |
| `fromYear` | `number` | First selectable year when there is no `min`. Default: current year - 100. |
| `toYear` | `number` | Last selectable year when there is no `max`. Default: current year + 20. |
| `shortcuts` | `boolean` | Show "first of month" / "last of month" shortcuts. |
| `yearFirst` | `boolean` | Show the year first (year / month / day). Default: day / month / year. |
| `name` | `string` | Hidden input with the ISO value for native forms. |
| `mobile` | `"sheet" \| "fullscreen" \| false` |  |
| `autoAdvance` | `boolean` | After a part is picked, open the next empty one (day, month, year; `yearFirst` reverses it). Skips filled parts, stops after the last. Off by default. |

Events: `update:modelValue`.

Slots: `label`, `meta`.


## ViCalendar

Bare calendar (no field). `range-start`/`range-end` draw a band; clicks emit `update:modelValue` and `hover`, the parent decides meaning.

| prop | type | notes |
|---|---|---|
| `modelValue` | `string \| null` | Selected day as ISO (`YYYY-MM-DD`; a time part is ignored). |
| `calendar` | `CalendarId` | Which calendar to draw. Default: Jalali for fa, otherwise Gregorian. |
| `min` | `string` |  |
| `max` | `string` |  |
| `marked` | `string[]` | Days to outline (e.g. a deadline). ISO dates. |
| `isDisabled` | `(iso: string) => boolean` | Return true to disable a day. Receives the ISO date. |
| `altDays` | `boolean` | Show the day number of the other calendar under each day. |
| `months` | `number` | Months shown side by side. |
| `weekStart` | `number` | 0 = Saturday ... 6 = Friday. |
| `weekend` | `number[]` | Weekend days as 0 = Saturday ... 6 = Friday. |
| `initialView` | `string` | Month to show when there is no value (ISO). |
| `rangeStart` | `string \| null` | Range mode: highlights the days between `rangeStart` and `rangeEnd` (ISO). While only the start is set, hovering a day previews the range. Clicks still emit `update:modelValue`; the parent decides what they mean. |
| `rangeEnd` | `string \| null` |  |

Events: `update:modelValue`, `hover`.

Expose: `goTo`, `focus`.


## ViTimePanel

The hour/minute columns on their own. Value is SECONDS since midnight (number), unlike ViTime.

| prop | type | notes |
|---|---|---|
| `modelValue` | `number \| null` | Seconds since midnight, or null. |
| `seconds` | `boolean` |  |
| `hour12` | `boolean` |  |
| `minuteStep` | `number` | Minute step (1, 5, 10, 15, 30). |
| `min` | `number \| null` | Allowed range, in seconds since midnight. |
| `max` | `number \| null` |  |
| `titles` | `boolean` | Show the column titles. |

Events: `update:modelValue`.

Expose: `reveal`.


## ViCheckbox

Boolean, array (`:value="x"` adds/removes it) or custom `true-value`/`false-value`. `indeterminate` is visual and controlled. `loading` blocks changes.

| prop | type | notes |
|---|---|---|
| `label` | `string` |  |
| `description` | `string` |  |
| `value` | `unknown` | Value to add to an array model (omit for a boolean model). |
| `trueValue` | `unknown` |  |
| `falseValue` | `unknown` |  |
| `indeterminate` | `boolean` | Show the "some selected" dash. Cleared by the user's click; keep it controlled. |
| `disabled` | `boolean` |  |
| `loading` | `boolean` | Pending state: shows a spinner and blocks changes (e.g. while saving to a server). |
| `status` | `FieldStatus` |  |
| `name` | `string` |  |
| `id` | `string` |  |

Slots: `default`, `description`.


## ViRadioGroup

Use `options=[{ value, label, description?, disabled? }]` or put `ViRadio` children in the default slot. `card` = boxed grid, `inline` = row.

| prop | type | notes |
|---|---|---|
| `options` | `RadioOption[]` |  |
| `label` | `string` | Group title (rendered as the fieldset legend). |
| `hint` | `string` |  |
| `message` | `string` |  |
| `status` | `FieldStatus` |  |
| `card` | `boolean` | Boxed options in a responsive grid. |
| `inline` | `boolean` | Lay options out in a wrapping row. |
| `disabled` | `boolean` |  |
| `loading` | `boolean` | Pending state for every option (spinner on the selected one, changes blocked). |
| `name` | `string` |  |

Slots: `default`.


## ViRadio

Single radio. Inside a `ViRadioGroup` it reads the group's model/name/card/loading.

| prop | type | notes |
|---|---|---|
| `value` (required) | `unknown` |  |
| `label` | `string` |  |
| `description` | `string` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` | Pending state: shows a spinner and blocks changes. A group's `loading` applies to all options. |
| `card` | `boolean` | Boxed look (set automatically inside a `card` ViRadioGroup). |
| `name` | `string` |  |

Slots: `default`, `description`.


## ViSwitch

Boolean or `true-value`/`false-value`. `loading` blocks changes.

| prop | type | notes |
|---|---|---|
| `label` | `string` |  |
| `description` | `string` |  |
| `trueValue` | `unknown` |  |
| `falseValue` | `unknown` |  |
| `disabled` | `boolean` |  |
| `loading` | `boolean` | Pending state: shows a spinner and blocks changes (e.g. while saving to a server). |
| `name` | `string` |  |
| `id` | `string` |  |

Slots: `default`, `description`.


## ViUpload

Drop zone + file list + upload + preview + sort. Two jobs: pick files to upload, and show files already on the server. `v-model` is `UploadFile[]` (also in single mode: zero or one item), never a bare `File`.

```ts
interface UploadFile { id: string | number; name: string; size?: number; type?: string; url?: string; thumb?: string;
  status?: "pending" | "uploading" | "done" | "error"; error?: string; file?: File; response?: unknown }
```
A file with no `file` and no `status` is a saved one (`done`). After an upload the item keeps its place, gets `status: "done"` and `id` / `url` from the server answer (`{ id, url }`, or `mapResponse`; a batch expects an array in file order).

Shared field props (`label hint message status required disabled readonly bare id ui`) work. `bare` is forced on (the zone is the frame).

| prop | type | notes |
|---|---|---|
| `modelValue` | `UploadFile[]` | |
| `multiple` | `boolean` | single mode replaces the file |
| `accept` | `string \| string[]` | `".pdf,.docx"`, `"image/*"`; an extension must END the name (`a.pdf.exe` is rejected for `.pdf`) |
| `maxSize` / `minSize` | `number \| string` | bytes or `"10MB"` (1 KB = 1024 B) |
| `maxFiles` | `number` | multiple only; extras are rejected with `reason: "count"` |
| `namePattern` | `RegExp` | |
| `maxNameLength` | `number` | |
| `validate` | `(file) => string \| false \| void` | message, or `false` for the default message |
| `url` | `string` | multipart POST (`XMLHttpRequest`, because `fetch` has no upload progress) |
| `method` `fieldName` `headers` `data` `withCredentials` `timeout` | | `fieldName` default `"file"`; `batch` sends `file[]`; `headers` may be a function (token refresh); `data` an object or `(files) => object` |
| `uploader` | `({ files, signal, progress }) => Promise<response>` | replaces `url` (S3, tus, chunks). `progress(0..1)` or `progress(null)` when the total is unknown |
| `batch` | `boolean` | one request for the files of one drop; progress is split across files by size (an approximation) |
| `auto` | `boolean` | default true; `false` shows an "Upload N files" button |
| `concurrency` | `number` | default 3, not in a batch |
| `mapResponse` | `(response, files) => Partial<UploadFile> \| Partial<UploadFile>[]` | |
| `beforeRemove` | `(file) => boolean \| Promise<boolean>` | only for saved files; `false` keeps it |
| `layout` | `"list" \| "grid"` | |
| `variant` | `"dropzone" \| "compact"` | |
| `preview` | `boolean` | default true; click a thumbnail to open a native `<dialog>` viewer (image, PDF, video, audio) |
| `downloadable` | `boolean` | default true |
| `reorderable` | `boolean` | drag the handle or use arrow keys / Home / End on it |
| `placeholder` | `string` | replaces the zone title |

Events: `update:modelValue`, `reject` (`{ file, reason, message }[]`; reasons `type size-max size-min name name-length count custom`), `success`, `error`, `remove`. Slots: `label`, `meta`, `drop`, `file`. Expose: `open() upload() retry(id) clear() files`.

Without `url` and `uploader` nothing is sent: files stay `pending` with `file` set, for you to submit with the form. Progress is the **sending** progress; a big file can sit at 100% while the server works. Client validation is a convenience: validate on the server too. Removing an uploading file aborts the request (one file of a batch aborts the whole batch). Exports: `parseBytes formatBytes acceptList matchesAccept validateFile kindOf xhrUploader UploadError` and the types.

## ViQueryBuilder

See `query-builder.md`.

Shared field props: `label hint message status required disabled readonly bare id ui`.

| prop | type | notes |
|---|---|---|
| `modelValue` | `QueryItem[]` | The filters, in order. Each is `{ key, op, value?, variant? }`. |
| `fields` (required) | `QueryField[]` | What can be filtered. |
| `placeholder` | `string` |  |
| `trigger` | `string` | Optional prefix typed to start a filter. Any typed text filters the field list too. |
| `clearable` | `boolean` | Show a "clear all" button. |
| `calendar` | `CalendarId` | Calendar for date values. Default: Jalali for fa, otherwise Gregorian. |
| `autoScroll` | `boolean` | Scroll the page a little when the panel fits neither above nor below (default). |

Events: `update:modelValue`.

Expose: `focus`, `cancel`, `el`.


## ViOptionList

Renders `rows` from `useOptions`; used by ViSelect and ViQueryBuilder. For custom selects.

| prop | type | notes |
|---|---|---|
| `rows` (required) | `Row[]` |  |
| `active` (required) | `number` | Index (into `rows`) of the keyboard/hover highlight, -1 for none. |
| `isSelected` (required) | `(option: Opt) => boolean` |  |
| `groupStateOf` (required) | `(group: Grp) => GroupState` |  |
| `multiple` | `boolean` |  |
| `query` | `string` | Current search text, used to mark matches. |
| `id` (required) | `string` | Element id; row `i` gets `${id}-${i}` (for aria-activedescendant). |
| `label` | `string` |  |

Events: `pick`, `pickGroup`, `hover`.

Slots: `option`, `group`.


## ViDateFoot

Internal footer (calendar switch, now, confirm). Not for direct use.

| prop | type | notes |
|---|---|---|
| `calendars` (required) | `CalendarId[]` |  |
| `calendar` (required) | `CalendarId` |  |
| `summary` (required) | `string` |  |
| `withTime` (required) | `boolean` |  |
| `sheet` | `boolean` | Inside a phone sheet: the value gets its own row (same structure as the date/time buttons). |
| `tabs` | `object \| null` | Phone sheet with a time: date and time buttons that switch the tab. |

Events: `update:calendar`, `now`, `confirm`, `tab`.


## Composables and helpers (named exports)

| export | for |
|---|---|
| `useField()` | inside a custom input: `{ id, attrs, status, disabled }` from the surrounding `ViField` (a11y attrs for the native control) |
| `usePopup(opts)` | position a fixed panel next to an anchor (flip, clamp, auto-scroll) |
| `useListNav({ count, isDisabled, loop, onSelect })` | keyboard highlight (ArrowUp/Down/Home/End/Enter) for a listbox |
| `useOptions({ options, accessors, query, filter })` | normalise strings/objects/groups into `rows` for `ViOptionList` |
| `useCalendar` | build a calendar grid (month nav, day cells, names) |
| `computePlacement` | the pure positioning math |
| `PlainDateTime`, `format`, `parseUserInput`, `jalaliToDays`, `daysToJalali`, `jalaliMonthLength`, `isJalaliLeap` | date engine, no time zones, ISO in/out (`fromISO` returns `null` when invalid) |
| `toPersianDigits`, `toLatinDigits`, `localizeDigits`, `normalizeText` | text helpers (convert to Latin before sending to a server) |
| `toQueryString`, `fromQueryString`, `validateItem`, `allowedOps` | ViQueryBuilder helpers |
| `THEME_TOKENS` | every `--vi-*` token name |
| `viputy` (plugin), `createConfig`, `useViputy` | locale, dir and messages |

## i18n keys

Messages live in `src/i18n/messages.ts` (`en`, `fa`, same keys). Override per app: `app.use(viputy, { locale: "fa", messages: { fa: { clear: "..." } } })`. A missing key falls back to English.
