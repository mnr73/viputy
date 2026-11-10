export const en = {
    close: "Close",
    clear: "Clear",
    confirm: "Confirm",
    cancel: "Cancel",
    search: "Search…",
    noResults: "No results found",
    tryAnother: "Try a different term",
    selectedCount: "{n} selected",
    selectAll: "Select all",
    loading: "Loading…"
};

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

export const fa: Messages = {
    close: "بستن",
    clear: "پاک کردن",
    confirm: "تایید",
    cancel: "انصراف",
    search: "جستجو…",
    noResults: "نتیجه‌ای پیدا نشد",
    tryAnother: "عبارت دیگری را امتحان کنید",
    selectedCount: "{n} مورد انتخاب شده",
    selectAll: "انتخاب همه",
    loading: "در حال بارگذاری…"
};

export const builtinMessages: Record<string, Messages> = { en, fa };
