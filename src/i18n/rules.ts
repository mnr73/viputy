/**
 * Default error messages of the validation rules. `{label}` is the input's label, `{min}` `{max}` `{n}`
 * come from the rule, `{value}` is what the user typed. Replace any of them per app
 * (`app.use(viputy, { rules: { fa: { required: "..." } } })`) or per input (`:messages`).
 */
export const ruleMessages: Record<string, Record<string, string>> = {
    en: {
        required: "This field is required",
        minLength: "Enter at least {min} characters",
        maxLength: "Enter at most {max} characters",
        length: "Enter exactly {n} characters",
        lengthBetween: "Enter between {min} and {max} characters",
        min: "Must be at least {min}",
        max: "Must be at most {max}",
        between: "Must be between {min} and {max}",
        integer: "Enter a whole number",
        pattern: "The format is not valid",
        email: "Enter a valid email address",
        url: "Enter a valid web address",
        phone: "Enter a valid mobile number",
        nationalId: "Enter a valid national code",
        cardNumber: "Enter a valid card number",
        digits: "Use digits only",
        oneOf: "Choose one of: {list}",
        notOneOf: "This value is not allowed",
        equals: "Does not match",
        minItems: "Choose at least {min}",
        maxItems: "Choose at most {max}",
        custom: "This value is not valid",
        validating: "Checking…"
    },
    fa: {
        required: "این فیلد الزامی است",
        minLength: "حداقل {min} نویسه وارد کنید",
        maxLength: "حداکثر {max} نویسه وارد کنید",
        length: "دقیقاً {n} نویسه وارد کنید",
        lengthBetween: "بین {min} تا {max} نویسه وارد کنید",
        min: "حداقل مقدار {min} است",
        max: "حداکثر مقدار {max} است",
        between: "مقدار باید بین {min} و {max} باشد",
        integer: "یک عدد صحیح وارد کنید",
        pattern: "قالب واردشده درست نیست",
        email: "یک نشانی ایمیل معتبر وارد کنید",
        url: "یک آدرس وب معتبر وارد کنید",
        phone: "یک شماره‌ی موبایل معتبر وارد کنید",
        nationalId: "کد ملی معتبر وارد کنید",
        cardNumber: "شماره‌ی کارت معتبر وارد کنید",
        digits: "فقط رقم وارد کنید",
        oneOf: "یکی از این‌ها را انتخاب کنید: {list}",
        notOneOf: "این مقدار مجاز نیست",
        equals: "مقدار برابر نیست",
        minItems: "حداقل {min} مورد انتخاب کنید",
        maxItems: "حداکثر {max} مورد انتخاب کنید",
        custom: "این مقدار معتبر نیست",
        validating: "در حال بررسی…"
    }
};
