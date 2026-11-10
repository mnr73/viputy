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
    loading: "Loading…",
    showPassword: "Show password",
    hidePassword: "Hide password",
    removeTag: "Remove {tag}",
    addTag: 'Add "{tag}" as a new tag',
    overLimit: "{n} characters over the limit",
    itemsCount: "{n} items",
    maxReached: "Limit reached",
    tagsMax: "Up to {max} tags; remove one to add another",
    countOf: "{n} of {total}",
    moreCount: "+{n}",
    noOptions: "No options"
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
    loading: "در حال بارگذاری…",
    showPassword: "نمایش گذرواژه",
    hidePassword: "پنهان کردن گذرواژه",
    removeTag: "حذف {tag}",
    addTag: "افزودن «{tag}» به‌عنوان برچسب جدید",
    overLimit: "{n} کاراکتر بیشتر از حد مجاز",
    itemsCount: "{n} مورد",
    maxReached: "به حداکثر رسیدید",
    tagsMax: "حداکثر {max} برچسب؛ برای افزودن یکی را حذف کنید",
    countOf: "{n} از {total}",
    moreCount: "+{n}",
    noOptions: "گزینه‌ای وجود ندارد"
};

export const builtinMessages: Record<string, Messages> = { en, fa };
