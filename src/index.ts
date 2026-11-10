import "./styles/index.css";

export { default as ViField } from "./components/ViField.vue";
export { default as ViPopup } from "./components/ViPopup.vue";

export { provideField, useField } from "./composables/useField";
export type { FieldContext, FieldStatus } from "./composables/useField";
export { edgeIndex, moveIndex, useListNav } from "./composables/useListNav";
export type { ListNavOptions } from "./composables/useListNav";
export { usePopup } from "./composables/usePopup";

export { createConfig, useViputy, viputy } from "./i18n/config";
export type { ViputyConfig, ViputyOptions } from "./i18n/config";
export type { MessageKey, Messages } from "./i18n/messages";

export { computePlacement } from "./utils/placement";
export type { Align, Placement, Side } from "./utils/placement";
export {
    localizeDigits,
    normalizeText,
    toLatinDigits,
    toPersianDigits
} from "./utils/text";
