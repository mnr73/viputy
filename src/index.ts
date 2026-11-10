import "./styles/index.css";

export { default as ViField } from "./components/ViField.vue";
export { default as ViPopup } from "./components/ViPopup.vue";
export { default as ViInput } from "./components/ViInput.vue";
export { default as ViText } from "./components/ViText.vue";
export { default as ViCheckbox } from "./components/ViCheckbox.vue";
export { default as ViRadio } from "./components/ViRadio.vue";
export { default as ViRadioGroup } from "./components/ViRadioGroup.vue";
export type { RadioOption } from "./components/ViRadioGroup.vue";
export { default as ViSwitch } from "./components/ViSwitch.vue";
export { default as ViSelect } from "./components/ViSelect.vue";
export { default as ViOptionList } from "./components/ViOptionList.vue";
export { default as ViTag } from "./components/ViTag.vue";
export type { FieldProps } from "./components/field-props";

export { provideField, useField } from "./composables/useField";
export type { FieldContext, FieldStatus } from "./composables/useField";
export { edgeIndex, moveIndex, useListNav } from "./composables/useListNav";
export type { ListNavOptions } from "./composables/useListNav";
export { usePopup } from "./composables/usePopup";
export { useOptions } from "./composables/useOptions";
export {
    buildRows,
    filterGroups,
    groupState,
    normalizeOption,
    normalizeOptions,
    toggleGroupValues
} from "./utils/options";
export type {
    Accessor,
    FilterFn,
    Grp,
    Opt,
    OptionAccessors,
    Row
} from "./utils/options";

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
