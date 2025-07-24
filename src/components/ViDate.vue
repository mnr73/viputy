<script setup lang="ts">
import ViDropdown from './ViDropdown.vue';
import { DateTime } from 'luxon';
import { computed, ref } from 'vue';
import {
  getDaysInMonthByType,
  jalaaliYMDToGregorian,
  luxonToJalaali,
  getMonthNames,
  getWeekDays,
  getFirstDayOfMonthPosition,
  jalaaliYMDToLuxon
} from '../utils/date';
import { sign } from 'crypto';

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
const monthNames = getMonthNames();
const hoverDay = ref();
const activeCalender = ref<ActiveCalendarType>(
  props.calender === 'both' ? props.activeCalender : props.calender
);
const weekDays = computed(() => {
  return getWeekDays(activeCalender.value);
});
const offsetDays = computed(() => {
  return getFirstDayOfMonthPosition(
    scrollDate.value.year,
    scrollDate.value.month,
    activeCalender.value
  );
});

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

const scrollDateValue = ref(props.modelValue || props.scrollDate);

const scrollDate = computed<{
  year: number;
  month: number;
  day: number;
}>(() => {
  if (activeCalender.value == 'gregorian') {
    let d = scrollDateValue.value;
    return {
      year: d.year,
      month: d.month,
      day: d.day
    };
  } else {
    let d = luxonToJalaali(scrollDateValue.value);
    return {
      year: d.jy,
      month: d.jm,
      day: d.jd
    };
  }
});
const today = computed<{
  year: number;
  month: number;
  day: number;
}>(() => {
  if (activeCalender.value == 'gregorian') {
    let d = DateTime.now();
    return {
      year: d.year,
      month: d.month,
      day: d.day
    };
  } else {
    let d = luxonToJalaali(DateTime.now());
    return {
      year: d.jy,
      month: d.jm,
      day: d.jd
    };
  }
});
const selectedDate = computed<{
  year: number | null;
  month: number | null;
  day: number | null;
}>(() => {
  if (!props.modelValue) {
    return {
      year: null,
      month: null,
      day: null
    };
  }
  if (activeCalender.value == 'gregorian') {
    let d = props.modelValue;
    return {
      year: d.year,
      month: d.month,
      day: d.day
    };
  } else {
    let d = luxonToJalaali(props.modelValue);
    return {
      year: d.jy,
      month: d.jm,
      day: d.jd
    };
  }
});
const year = ref<number>(scrollDate.value.year);
const month = ref<number>(scrollDate.value.month);

function setMonthLength() {
  if (scrollDate.value.year && scrollDate.value.month) {
    dayLength.value =
      getDaysInMonthByType(
        scrollDate.value.year,
        scrollDate.value.month,
        activeCalender.value == 'persian'
      ) ?? 31;
  }
}

function setScroll() {
  if (showDateStatus.value == null) {
    showDateStatus.value = 'now';
  } else if (showDateStatus.value !== 'signed' && props.signedDate) {
    showDateStatus.value = 'signed';
  } else if (showDateStatus.value !== 'selected' && props.modelValue) {
    showDateStatus.value = 'selected';
  } else {
    showDateStatus.value = 'null';
  }
  console.log(showDateStatus.value);

  if (showDateStatus.value == 'now') {
    scrollDateValue.value = DateTime.now();
  } else if (showDateStatus.value == 'signed') {
    scrollDateValue.value = props.signedDate || DateTime.now();
  } else if (showDateStatus.value == 'selected') {
    scrollDateValue.value = props.modelValue || DateTime.now();
  }
  month.value = scrollDate.value.month;
  year.value = scrollDate.value.year;
}

function setDay(val: number) {
  setValue(val);
  change();
}

function setYearMonth() {
  scrollDateValue.value = jalaaliYMDToLuxon(
    year.value,
    month.value,
    scrollDate.value.day
  );

  change();
}

function showNextMonth() {
  scrollDateValue.value = scrollDateValue.value.plus({ month: 1 });
  month.value = scrollDate.value.month;
  year.value = scrollDate.value.year;
}

function showPreviousMonth() {
  scrollDateValue.value = scrollDateValue.value.minus({ month: 1 });
  month.value = scrollDate.value.month;
  year.value = scrollDate.value.year;
}

function close() {}

function change() {
  // if (year.value && month.value) {
  //   setMonthLength();
  // }
}

function setValue(day: number) {
  element.value?.closeList();
  if (activeCalender.value == 'gregorian') {
    value.value = DateTime.fromObject({
      year: scrollDate.value.year,
      month: scrollDate.value.month,
      day: day
    });
  } else {
    const { gy, gm, gd } = jalaaliYMDToGregorian(
      scrollDate.value.year,
      scrollDate.value.month,
      day
    );
    value.value = DateTime.fromObject({
      year: gy,
      month: gm,
      day: gd
    });
  }
}

function changeCalenderToPersian() {
  if (activeCalender.value == 'persian') return;

  activeCalender.value = 'persian';

  year.value = scrollDate.value.year;
  month.value = scrollDate.value.month;

  setMonthLength();
}

function changeCalenderToGregorian() {
  if (activeCalender.value == 'gregorian') return;
  activeCalender.value = 'gregorian';
  year.value = scrollDate.value.year;
  month.value = scrollDate.value.month;
  setMonthLength();
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
  // if (e.code == 'Enter') {
  //   if (year.value && month.value && day.value) {
  //     setValue();
  //   }
  // }
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
  // year.value = null;
  // month.value = null;
  // day.value = null;
  emit('change');
}

const showHint = computed(() => {
  if (hoverDay.value) {
    return `${hoverDay.value} ${monthNames[scrollDate.value.month][activeCalender.value]} ${scrollDate.value.year}`;
  }
  if (selectedDate.value.day && selectedDate.value.month) {
    return `${selectedDate.value.day} ${monthNames[selectedDate.value.month][activeCalender.value]} ${selectedDate.value.year}`;
  }
  return `${scrollDate.value.day} ${monthNames[scrollDate.value.month][activeCalender.value]} ${scrollDate.value.year}`;
});
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
              value.toFormat(props.persianFormat, {
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
        <div class="flex gap-2 justify-between items-center">
          <button class="w-8" @click="showPreviousMonth" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="w-full rtl:rotate-y-180"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 6s-6 4.419-6 6s6 6 6 6"
              />
            </svg>
          </button>
          <div class="flex-1 text-center">
            <label class="flex gap-1">
              <span v-show="!focusMonthInput" class="w-full">
                {{ monthNames[scrollDate.month][activeCalender] }} ({{
                  scrollDate.month
                }})
              </span>
              <input
                @focus="focusMonthInput = true"
                @blur="focusMonthInput = false"
                v-model="month"
                type="number"
                class="min-w-0 w-0 outline-0"
                :class="{ 'w-full': focusMonthInput }"
                @input="setYearMonth()"
                @keydown.enter.prevent="setYearMonth()"
                min="1"
                max="12"
            /></label>
          </div>
          <div class="flex-1 text-center">
            <label class="flex gap-1"
              ><span v-show="!focusYearInput" class="w-full">
                {{ scrollDate.year }}
              </span>
              <input
                @focus="focusYearInput = true"
                @blur="focusYearInput = false"
                v-model="year"
                type="number"
                class="min-w-0 w-0 outline-0"
                :class="{ 'w-full': focusYearInput }"
                :min="minYear"
                :max="maxYear"
                @change="setYearMonth()"
                @keydown.enter.prevent="setYearMonth()"
            /></label>
          </div>
          <button class="w-8" @click="showNextMonth" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="w-full ltr:rotate-y-180"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 6s-6 4.419-6 6s6 6 6 6"
              />
            </svg>
          </button>
        </div>
        <hr class="border-slate-200 my-2" />
        <div class="grid grid-cols-7 gap-2 text-center">
          <div
            class="w-full aspect-square rounded-md flex items-center justify-center text-slate-500"
            v-for="(day, index) in weekDays"
            :key="index"
          >
            {{ day[activeCalender] }}
          </div>
          <div v-for="n in offsetDays" :key="n"></div>
          <div
            class="w-full aspect-square rounded-md shadow-md shadow-slate-200 flex items-center justify-center text-slate-500 cursor-pointer relative border-slate-200 border"
            v-for="dayNumber in dayLength"
            :key="dayNumber"
            @click="setDay(dayNumber)"
            @mouseover="hoverDay = dayNumber"
            @mouseleave="hoverDay = null"
          >
            <span>{{ dayNumber }}</span>
            <div
              class="h-1 w-[60%] absolute bottom-0 start-[20%] rounded-t-xl"
              :class="{
                'bg-slate-500': hoverDay === dayNumber,
                'bg-sky-500':
                  dayNumber === selectedDate?.day &&
                  selectedDate?.month == scrollDate?.month &&
                  selectedDate?.year == scrollDate?.year
              }"
            ></div>
            <div
              class="h-1 w-[60%] absolute top-0 start-[20%] rounded-b-xl bg-yellow-500"
              v-if="
                dayNumber === signedDate?.day &&
                signedDate?.month == scrollDate?.month &&
                signedDate?.year == scrollDate?.year
              "
            ></div>
            <div
              class="h-1 w-1 absolute top-2 start-1 rounded-full bg-yellow-500"
              v-if="
                dayNumber === today?.day &&
                today?.month == scrollDate?.month &&
                today?.year == scrollDate?.year
              "
            ></div>
          </div>
        </div>
        <hr class="border-slate-200 my-2" />
        <div class="flex gap-2">
          <div class="w-full">
            <bdi>{{ showHint }}</bdi>
          </div>
          <button
            class="bg-slate-100 dark:bg-zinc-800 rounded-md w-10 py-1 px-2 text-slate-500"
            type="button"
            @click="setScroll"
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
