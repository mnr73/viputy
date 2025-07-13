<script setup lang="ts">
import ViDropdown from './ViDropdown.vue';
import { DateTime } from 'luxon';
import { computed, ref } from 'vue';
import {
  getDaysInMonthByType,
  jalaaliYMDToGregorian,
  luxonToJalaali
} from '../utils/date';

type CalendarType = 'gregorian' | 'persian' | 'both';
type ActiveCalendarType = 'gregorian' | 'persian';
type StatusType = 'error' | 'warning' | 'true' | null;

interface TranslateType {
  day: string;
  month: string;
  year: string;
  set: string;
  selectDate: string;
  gregorian: string;
  persian: string;
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateTime | null): void;
  (e: 'change'): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: DateTime | null;
    calender?: CalendarType;
    activeCalender?: ActiveCalendarType;
    min?: DateTime;
    max?: DateTime;
    scrollDate?: DateTime;
    title?: string | null;
    status?: StatusType;
    disabled?: boolean;
    required?: boolean;
    noFrame?: boolean;
    signedDate?: DateTime | null;
    persianIntl?: string;
    gregorianIntl?: string;
    persianFormat?: string;
    gregorianFormat?: string;
    translate?: TranslateType;
  }>(),
  {
    calender: 'gregorian',
    activeCalender: 'gregorian',
    min: () => DateTime.now().minus({ year: 100 }),
    max: () => DateTime.now().plus({ year: 20 }),
    scrollDate: () => DateTime.now(),
    title: null,
    status: null,
    disabled: false,
    required: undefined,
    noFrame: false,
    signedDate: null,
    persianIntl: 'fa-IR-u-nu-latn',
    gregorianIntl: 'en-us',
    persianFormat: 'dd MMMM yyyy',
    gregorianFormat: 'dd MMMM yyyy',
    translate: () => ({
      day: 'day',
      month: 'month',
      year: 'year',
      set: 'set',
      selectDate: 'select date',
      gregorian: 'Gregorian',
      persian: 'Persian'
    })
  }
);

const showDateStatus = ref<string | null>(null);
const element = ref<InstanceType<typeof ViDropdown>>();
const dayBox = ref<HTMLElement>();
const monthBox = ref<HTMLElement>();
const yearBox = ref<HTMLElement>();
const focusDayInput = ref(false);
const focusMonthInput = ref(false);
const focusYearInput = ref(false);
const autoSet = ref(new Set<string>([]));
const monthNames: Record<number, { persian: string; gregorian: string }> = {
  1: { persian: 'فروردین', gregorian: 'January' },
  2: { persian: 'اردیبهشت', gregorian: 'February' },
  3: { persian: 'خرداد', gregorian: 'March' },
  4: { persian: 'تیر', gregorian: 'April' },
  5: { persian: 'مرداد', gregorian: 'May' },
  6: { persian: 'شهریور', gregorian: 'June' },
  7: { persian: 'مهر', gregorian: 'July' },
  8: { persian: 'آبان', gregorian: 'August' },
  9: { persian: 'آذر', gregorian: 'September' },
  10: { persian: 'دی', gregorian: 'October' },
  11: { persian: 'بهمن', gregorian: 'November' },
  12: { persian: 'اسفند', gregorian: 'December' }
};
const activeCalender = ref<ActiveCalendarType>(
  props.calender === 'both' ? props.activeCalender : props.calender
);

const minYear = computed<number>(() => {
  if (activeCalender.value == 'gregorian') {
    return props.min.year;
  } else {
    return luxonToJalaali(props.min).jy;
  }
});
const maxYear = computed<number>(() => {
  if (activeCalender.value == 'gregorian') {
    return props.max.year;
  } else {
    return luxonToJalaali(props.max).jy;
  }
});
const year = ref<number | null>(props.modelValue?.year ?? null);
const month = ref<number | null>(props.modelValue?.month ?? null);
const day = ref<number | null>(props.modelValue?.day ?? null);
const dayLength = ref<number>(31);

const value = computed<DateTime | null>({
  get() {
    return props.modelValue ?? null;
  },
  set(val) {
    emit('update:modelValue', val);
  }
});

const signedDate = computed<{
  year: number | null;
  month: number | null;
  day: number | null;
}>(() => {
  if (!props.signedDate) {
    return {
      year: null,
      month: null,
      day: null
    };
  }
  if (activeCalender.value == 'gregorian') {
    let d = props.signedDate;
    return {
      year: d.year,
      month: d.month,
      day: d.day
    };
  } else {
    let d = luxonToJalaali(props.signedDate);
    return {
      year: d.jy,
      month: d.jm,
      day: d.jd
    };
  }
});

const scrollDate = computed<{
  year: number | null;
  month: number | null;
  day: number | null;
}>(() => {
  if (!props.scrollDate) {
    return {
      year: null,
      month: null,
      day: null
    };
  }
  if (activeCalender.value == 'gregorian') {
    let d = props.scrollDate;
    return {
      year: d.year,
      month: d.month,
      day: d.day
    };
  } else {
    let d = luxonToJalaali(props.scrollDate);
    return {
      year: d.jy,
      month: d.jm,
      day: d.jd
    };
  }
});

function setMonthLength() {
  if (year.value && month.value) {
    dayLength.value =
      getDaysInMonthByType(
        year.value,
        month.value,
        activeCalender.value == 'persian'
      ) ?? 31;
    if (day.value && day.value > dayLength.value) {
      setDay(dayLength.value, false);
    }
  }
}

function setScroll(signed = false) {
  setTimeout(() => {
    if (signedDate.value.day || day.value) {
      scrollToMid(dayBox.value, signed ? signedDate.value.day : day.value);
    } else {
      scrollToMid(dayBox.value, scrollDate.value.day);
    }

    if (signedDate.value.day || day.value) {
      scrollToMid(
        monthBox.value,
        signed ? signedDate.value.month : month.value
      );
    } else {
      scrollToMid(monthBox.value, scrollDate.value.month);
    }

    if (signedDate.value.day || day.value) {
      scrollToMid(yearBox.value, signed ? signedDate.value.year : year.value);
    } else {
      scrollToMid(yearBox.value, scrollDate.value.year);
    }
  }, 60);
}

function scrollToMid(box: HTMLElement | undefined, number: number | null) {
  if (box && number !== null) {
    let el = box.querySelector<HTMLElement>(`[data-value="${number}"]`);
    if (el) {
      box.scrollTo(0, el.offsetTop - 70);
    }
  }
}

function setDay(val: number | null, auto = false) {
  if (auto) autoSet.value.add('day');
  day.value = val;
  scrollToMid(dayBox.value, val);
  change();
}

function setMonth(val: number | null, auto = false) {
  if (auto) autoSet.value.add('month');
  month.value = val;
  scrollToMid(monthBox.value, val);
  change();
}

function setYear(val: number | null, auto = false) {
  if (auto) autoSet.value.add('year');
  year.value = val;
  scrollToMid(yearBox.value, val);
  change();
}

function open() {
  if (props.modelValue) {
    if (activeCalender.value == 'gregorian') {
      year.value = props.modelValue?.year ?? null;
      month.value = props.modelValue?.month ?? null;
      day.value = props.modelValue?.day ?? null;
    } else {
      let persian = luxonToJalaali(props.modelValue);

      year.value = persian.jy;
      month.value = persian.jm;
      day.value = persian.jd;
    }
  }

  setScroll();
}
function close() {
  autoSet.value.clear();
}

function change() {
  if (year.value && month.value) {
    setMonthLength();
  }
  if (autoSet.value.size >= 3) {
    setValue();
  }
}

function setValue() {
  element.value?.closeList();
  if (year.value && month.value && day.value) {
    if (activeCalender.value == 'gregorian') {
      value.value = DateTime.fromObject({
        year: year.value,
        month: month.value,
        day: day.value
      });
    } else {
      const { gy, gm, gd } = jalaaliYMDToGregorian(
        year.value,
        month.value,
        day.value
      );
      value.value = DateTime.fromObject({
        year: gy,
        month: gm,
        day: gd
      });
    }
  }
}

function changeCalenderToPersian() {
  if (activeCalender.value == 'persian') return;

  activeCalender.value = 'persian';

  if (year.value && month.value && day.value) {
    let persianDate = luxonToJalaali(
      DateTime.fromObject({
        year: year.value,
        month: month.value,
        day: day.value
      })
    );
    year.value = persianDate.jy;
    month.value = persianDate.jm;
    day.value = persianDate.jd;
  }

  setMonthLength();
  setScroll();
}

function changeCalenderToGregorian() {
  if (activeCalender.value == 'gregorian') return;
  activeCalender.value = 'gregorian';

  if (year.value && month.value && day.value) {
    let { gy, gm, gd } = jalaaliYMDToGregorian(
      year.value,
      month.value,
      day.value
    );

    year.value = gy;
    month.value = gm;
    day.value = gd;
  }
  setMonthLength();
  setScroll();
}

function handleKey(e: KeyboardEvent) {
  if (e.code == 'Escape') {
    e.preventDefault();
    element.value?.closeList();
    element.value?.blurInput();
  }
  if (e.code == 'Space') {
    e.preventDefault();
    element.value?.toggleList();
  }
  if (e.code == 'Enter') {
    if (year.value && month.value && day.value) {
      setValue();
    }
  }
  if (e.code === 'Delete') {
    clearInput();
  }
  if (e.code == 'Tab') {
    if (focusYearInput.value == true) {
      element.value?.closeList();
    }
  }
}

function clearInput() {
  value.value = null;
  year.value = null;
  month.value = null;
  day.value = null;
  emit('change');
}

function showDate() {
  if (showDateStatus.value !== 'signed' && props.signedDate) {
    showDateStatus.value = 'signed';
    setScroll(true);
  } else if (value.value) {
    showDateStatus.value = 'value';
    setScroll();
  }
}
</script>

<template>
  <ViDropdown
    :title="props.title"
    :status="props.status"
    :disabled="props.disabled"
    :required="props.required"
    :noFrame="props.noFrame"
    :action-keys="false"
    ref="element"
    @openPopup="open"
    @closePopup="close"
    @keydown="handleKey"
  >
    <template #before>
      <slot name="before"></slot>
    </template>
    <template #after>
      <slot name="after"></slot>
      <span
        class="w-5 aspect-square p-[1px] rounded-full bg-slate-500 hover:bg-red-500 cursor-pointer text-white flex items-center justify-center"
        @click.stop="clearInput"
        v-show="value"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-full"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="m18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6"
            color="currentColor"
          />
        </svg>
      </span>
    </template>
    <template #label>
      <slot name="label" :date="value">
        <span v-if="value">
          <template v-if="activeCalender === 'gregorian'">
            <bdi>{{
              value.toFormat(props.gregorianFormat, {
                locale: props.gregorianIntl
              })
            }}</bdi>
          </template>
          <template v-else>
            <bdi>{{
              value.toFormat(props.gregorianFormat, {
                locale: props.persianIntl
              })
            }}</bdi>
          </template>
        </span>
        <span v-else>select date</span>
      </slot>
    </template>
    <template #popup>
      <div class="w-[300px] max-w-full">
        <div class="flex gap-2 mb-2" v-if="props.calender == 'both'">
          <button
            class="bg-slate-100 rounded-md w-full py-1 cursor-pointer"
            :class="{
              '!bg-sky-500 text-white ': activeCalender == 'gregorian'
            }"
            type="button"
            @click="changeCalenderToGregorian"
          >
            {{ props.translate.gregorian }}
          </button>
          <button
            class="bg-slate-100 rounded-md w-full py-1 cursor-pointer"
            :class="{
              '!bg-sky-500 text-white ': activeCalender == 'persian'
            }"
            type="button"
            @click="changeCalenderToPersian"
          >
            {{ props.translate.persian }}
          </button>
        </div>
        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="">
            <label class="flex gap-1"
              ><span v-show="!focusDayInput" class="w-full">{{
                props.translate.day
              }}</span>
              <input
                @focus="focusDayInput = true"
                @blur="focusDayInput = false"
                v-model="day"
                type="number"
                class="min-w-0 w-0 outline-0"
                :class="{ 'w-full': focusDayInput }"
                @change="setDay(day)"
                @keydown.enter.prevent="setDay(day)"
                min="1"
                :max="dayLength"
            /></label>
          </div>
          <div class="col-span-2">
            <label class="flex gap-1"
              ><span v-show="!focusMonthInput" class="w-full">{{
                props.translate.month
              }}</span>
              <input
                @focus="focusMonthInput = true"
                @blur="focusMonthInput = false"
                v-model="month"
                type="number"
                class="min-w-0 w-0 outline-0"
                :class="{ 'w-full': focusMonthInput }"
                @change="setMonth(month)"
                @keydown.enter.prevent="setMonth(month)"
                min="1"
                max="12"
            /></label>
          </div>
          <div class="">
            <label class="flex gap-1"
              ><span v-show="!focusYearInput" class="w-full">{{
                props.translate.year
              }}</span>
              <input
                @focus="focusYearInput = true"
                @blur="focusYearInput = false"
                v-model="year"
                type="number"
                class="min-w-0 w-0 outline-0"
                :class="{ 'w-full': focusYearInput }"
                :min="min.year"
                :max="max.year"
                @change="setYear(year)"
                @keydown.enter.prevent="setYear(year)"
            /></label>
          </div>
        </div>
        <hr class="border-slate-200 my-2" />
        <div class="grid grid-cols-4 gap-1 text-center">
          <div
            class="h-[200px] overflow-y-auto scroll-smooth relative"
            style="scrollbar-width: none"
            ref="dayBox"
          >
            <div class="grid gap-1 my-[100px]">
              <div
                class="p-1 bg-slate-50 dark:bg-zinc-600 rounded-md cursor-pointer relative"
                v-for="dayNumber in dayLength"
                :key="dayNumber"
                :class="{
                  '!bg-sky-300': day == dayNumber
                }"
                :data-value="dayNumber"
                @click="setDay(dayNumber, true)"
              >
                <div
                  v-if="signedDate.day == dayNumber"
                  class="w-2 h-2 rounded-full absolute top-1 end-1 bg-amber-400"
                ></div>
                {{ dayNumber }}
              </div>
            </div>
          </div>
          <div
            class="col-span-2 h-[200px] overflow-y-auto scroll-smooth relative"
            ref="monthBox"
            style="scrollbar-width: none"
          >
            <div class="grid gap-1 my-[100px]">
              <div
                class="p-1 bg-slate-50 dark:bg-zinc-600 rounded-md cursor-pointer relative"
                v-for="(monthName, monthNumber) in monthNames"
                :key="monthNumber"
                :class="{ '!bg-sky-300': month == monthNumber }"
                :data-value="monthNumber"
                @click="setMonth(monthNumber, true)"
              >
                <div
                  v-if="signedDate.month == monthNumber"
                  class="w-2 h-2 rounded-full absolute top-1 end-1 bg-amber-400"
                ></div>
                {{ monthName[activeCalender] }} ({{ monthNumber }})
              </div>
            </div>
          </div>
          <div
            class="h-[200px] overflow-y-auto scroll-smooth relative"
            style="scrollbar-width: none"
            ref="yearBox"
          >
            <div class="grid gap-1 my-[100px]">
              <div
                class="p-1 bg-slate-50 dark:bg-zinc-600 rounded-md cursor-pointer relative"
                v-for="yearNumber in Array.from(
                  { length: maxYear - minYear + 1 },
                  (_, i) => minYear + i
                )"
                :key="yearNumber"
                :class="{ '!bg-sky-300': year == yearNumber }"
                :data-value="yearNumber"
                @click="setYear(yearNumber, true)"
              >
                <div
                  v-if="signedDate.year == yearNumber"
                  class="w-2 h-2 rounded-full absolute top-1 end-1 bg-amber-400"
                ></div>
                {{ yearNumber }}
              </div>
            </div>
          </div>
        </div>
        <hr class="border-slate-200 my-2" />
        <div class="flex gap-2">
          <button
            class="bg-slate-100 dark:bg-zinc-800 rounded-md w-full py-1"
            type="button"
            @click="setValue"
          >
            {{ props.translate.set }}
          </button>
          <button
            class="bg-slate-100 dark:bg-zinc-800 rounded-md w-10 py-1 px-2 text-slate-500"
            type="button"
            @click="showDate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </ViDropdown>
</template>
