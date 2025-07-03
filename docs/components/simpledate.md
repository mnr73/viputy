# ViSimpleDate Examples

Interactive examples demonstrating the ViSimpleDate component for date selection with Persian/Gregorian calendar support.

<script setup>
import { ref } from 'vue'
import ViSimpleDate from '../../src/components/ViSimpleDate.vue'
import { DateTime } from 'luxon'

// Basic examples
const basicDate = ref(null)
const initialDate = ref(DateTime.now())
const emptyDate = ref(null)

// Status examples
const errorDate = ref(null)
const warningDate = ref(null)
const successDate = ref(DateTime.now().plus({ days: 7 }))

// State examples
const disabledDate = ref(DateTime.now())
const readonlyDate = ref(DateTime.fromISO('2024-01-15'))

// Calendar type examples
const persianDate = ref(null)
const gregorianDate = ref(null)

// Min/Max examples
const restrictedDate = ref(null)
const futureDate = ref(null)
const pastDate = ref(null)

// Real-world examples
const birthdateDate = ref(null)
const appointmentDate = ref(null)
const deadlineDate = ref(null)
const eventDate = ref(null)

// Advanced examples
const customFormatDate = ref(null)
const rangeStartDate = ref(null)
const rangeEndDate = ref(null)
</script>

## What is ViSimpleDate?

ViSimpleDate is a powerful date picker component that supports both **Persian (Jalali)** and **Gregorian** calendars. It uses Luxon DateTime objects for precise date handling and provides a clean, accessible interface for date selection.

### Key Features

- 🗓️ **Dual Calendar Support** - Persian (Jalali) and Gregorian calendars
- 🌍 **Luxon Integration** - Uses DateTime objects for robust date handling
- 🎯 **Min/Max Constraints** - Restrict selectable date ranges
- 🎨 **Status Indicators** - Error, warning, and success states
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 🔧 **Customizable** - Flexible styling and behavior options

### Important: Luxon Dependency

**Required**: Install Luxon for date handling:

```bash
npm install luxon
```

**v-model Type**: Must be `null` or a Luxon `DateTime` object.

## Basic Usage

### Simple Date Picker

Basic date selection with default settings.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="basicDate" 
    title="Select Date"
    placeholder="Choose a date..."
  />
  <div class="text-sm text-gray-600">
    Selected: {{ basicDate ? basicDate.toISODate() : 'None' }}
  </div>
</div>
:::

```vue
<script setup>
import { ref } from 'vue';
import { ViSimpleDate } from '@mnr73/viputy/datePicker';
import { DateTime } from 'luxon';

const selectedDate = ref(null);
</script>

<template>
  <ViSimpleDate
    v-model="selectedDate"
    title="Select Date"
    placeholder="Choose a date..."
  />
</template>
```

### With Initial Date

Starting with a pre-selected date.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="initialDate" 
    title="Birth Date"
    placeholder="Select your birth date"
  />
  <div class="text-sm text-gray-600">
    Selected: {{ initialDate ? initialDate.toFormat('yyyy-MM-dd') : 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const birthDate = ref(DateTime.fromISO('1990-01-15'));
</script>

<template>
  <ViSimpleDate v-model="birthDate" title="Birth Date" />
</template>
```

## Calendar Types

### Persian (Jalali) Calendar

Using Persian calendar system.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="persianDate" 
    title="تاریخ فارسی"
    calender="persian"
    placeholder="انتخاب تاریخ..."
  />
  <div class="text-sm text-gray-600">
    Persian Date: {{ persianDate ? persianDate.toFormat('yyyy/MM/dd', { calendar: 'persian' }) : 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const persianDate = ref(null);
</script>

<template>
  <ViSimpleDate
    v-model="persianDate"
    title="تاریخ فارسی"
    calender="persian"
    placeholder="انتخاب تاریخ..."
  />
</template>
```

### Gregorian Calendar

Explicitly using Gregorian calendar.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="gregorianDate" 
    title="Gregorian Date"
    calender="gregorian"
    placeholder="Select date..."
  />
  <div class="text-sm text-gray-600">
    Gregorian: {{ gregorianDate ? gregorianDate.toFormat('MMM dd, yyyy') : 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const gregorianDate = ref(null);
</script>

<template>
  <ViSimpleDate
    v-model="gregorianDate"
    title="Gregorian Date"
    calender="gregorian"
  />
</template>
```

### Both Calendars (Switchable)

Showing both calendar options with toggle buttons.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="eventDate" 
    title="Event Date"
    calender="both"
    activeCalender="gregorian"
    placeholder="Select event date..."
  />
  <div class="text-sm text-gray-600">
    Selected: {{ eventDate ? eventDate.toFormat('yyyy-MM-dd') : 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const eventDate = ref(null);
</script>

<template>
  <ViSimpleDate
    v-model="eventDate"
    title="Event Date"
    calender="both"
    activeCalender="gregorian"
  />
</template>
```

## Status Indicators

### Error Status

::: raw
<ViSimpleDate 
  v-model="errorDate" 
  title="Invalid Date" 
  status="error"
  placeholder="Please select a valid date"
/>
:::

```vue
<ViSimpleDate v-model="date" title="Invalid Date" status="error" />
```

### Warning Status

::: raw
<ViSimpleDate 
  v-model="warningDate" 
  title="Check Date" 
  status="warning"
  placeholder="Please verify this date"
/>
:::

```vue
<ViSimpleDate v-model="date" title="Check Date" status="warning" />
```

### Success Status

::: raw
<ViSimpleDate 
  v-model="successDate" 
  title="Confirmed Date" 
  status="true"
  placeholder="Date confirmed"
/>
:::

```vue
<ViSimpleDate v-model="date" title="Confirmed Date" status="true" />
```

## Date Constraints

### Future Dates Only

Restrict selection to future dates.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="futureDate" 
    title="Future Event"
    :min="DateTime.now()"
    placeholder="Select a future date..."
  />
  <div class="text-sm text-gray-600">
    Minimum: {{ DateTime.now().toFormat('yyyy-MM-dd') }} (Today)
  </div>
</div>
:::

```vue
<script setup>
const futureDate = ref(null);
const today = DateTime.now();
</script>

<template>
  <ViSimpleDate v-model="futureDate" title="Future Event" :min="today" />
</template>
```

### Past Dates Only

Restrict selection to past dates.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="pastDate" 
    title="Historical Date"
    :max="DateTime.now()"
    placeholder="Select a past date..."
  />
  <div class="text-sm text-gray-600">
    Maximum: {{ DateTime.now().toFormat('yyyy-MM-dd') }} (Today)
  </div>
</div>
:::

```vue
<script setup>
const pastDate = ref(null);
const today = DateTime.now();
</script>

<template>
  <ViSimpleDate v-model="pastDate" title="Historical Date" :max="today" />
</template>
```

### Date Range Restriction

Limiting selection to a specific range.

::: raw

<div class="space-y-4">
  <ViSimpleDate 
    v-model="restrictedDate" 
    title="Available Dates"
    :min="DateTime.now().minus({ days: 30 })"
    :max="DateTime.now().plus({ days: 60 })"
    placeholder="Select within allowed range..."
  />
  <div class="text-sm text-gray-600">
    Range: {{ DateTime.now().minus({ days: 30 }).toFormat('MMM dd') }} - {{ DateTime.now().plus({ days: 60 }).toFormat('MMM dd, yyyy') }}
  </div>
</div>
:::

```vue
<script setup>
const restrictedDate = ref(null);
const minDate = DateTime.now().minus({ days: 30 });
const maxDate = DateTime.now().plus({ days: 60 });
</script>

<template>
  <ViSimpleDate
    v-model="restrictedDate"
    title="Available Dates"
    :min="minDate"
    :max="maxDate"
  />
</template>
```

## Component States

### Disabled Date Picker

::: raw
<ViSimpleDate 
  v-model="disabledDate" 
  title="Disabled Field" 
  disabled
/>
:::

```vue
<ViSimpleDate v-model="date" title="Disabled Field" disabled />
```

### Read-only Date Picker

::: raw
<ViSimpleDate 
  v-model="readonlyDate" 
  title="Read-only Field" 
  readonly
/>
:::

```vue
<ViSimpleDate v-model="date" title="Read-only Field" readonly />
```

## Real-world Examples

### Birth Date Selection

Age-appropriate birth date picker.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h4 class="font-medium">👤 Personal Information</h4>
  <ViSimpleDate 
    v-model="birthdateDate" 
    title="Date of Birth"
    :max="DateTime.now().minus({ years: 13 })"
    :min="DateTime.now().minus({ years: 120 })"
    placeholder="Select your birth date"
  />
  <div class="text-sm text-gray-600">
    Age requirements: 13-120 years old
  </div>
  <div v-if="birthdateDate" class="text-sm">
    <strong>Age:</strong> {{ Math.floor(DateTime.now().diff(birthdateDate, 'years').years) }} years old
  </div>
</div>
:::

```vue
<script setup>
const birthDate = ref(null);
const minBirthDate = DateTime.now().minus({ years: 120 });
const maxBirthDate = DateTime.now().minus({ years: 13 });

const age = computed(() => {
  if (!birthDate.value) return null;
  return Math.floor(DateTime.now().diff(birthDate.value, 'years').years);
});
</script>

<template>
  <ViSimpleDate
    v-model="birthDate"
    title="Date of Birth"
    :min="minBirthDate"
    :max="maxBirthDate"
  />
</template>
```

### Appointment Scheduling

Future appointment booking.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h4 class="font-medium">📅 Schedule Appointment</h4>
  <ViSimpleDate 
    v-model="appointmentDate" 
    title="Appointment Date"
    :min="DateTime.now().plus({ days: 1 })"
    :max="DateTime.now().plus({ months: 3 })"
    placeholder="Choose appointment date"
  />
  <div class="text-sm text-gray-600">
    Available: Tomorrow to {{ DateTime.now().plus({ months: 3 }).toFormat('MMM dd, yyyy') }}
  </div>
  <div v-if="appointmentDate" class="p-3 bg-blue-50 rounded">
    <div class="text-sm">
      <strong>Selected:</strong> {{ appointmentDate.toFormat('EEEE, MMMM dd, yyyy') }}
    </div>
    <div class="text-xs text-gray-600 mt-1">
      {{ appointmentDate.diff(DateTime.now(), 'days').days }} days from now
    </div>
  </div>
</div>
:::

```vue
<script setup>
const appointmentDate = ref(null);
const tomorrow = DateTime.now().plus({ days: 1 });
const maxDate = DateTime.now().plus({ months: 3 });
</script>

<template>
  <ViSimpleDate
    v-model="appointmentDate"
    title="Appointment Date"
    :min="tomorrow"
    :max="maxDate"
  />
</template>
```

### Project Deadline

Setting project deadlines with validation.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h4 class="font-medium">📋 Project Deadline</h4>
  <ViSimpleDate 
    v-model="deadlineDate" 
    title="Deadline"
    :min="DateTime.now().plus({ days: 7 })"
    placeholder="Set project deadline"
    :status="deadlineDate && deadlineDate.diff(DateTime.now(), 'days').days < 14 ? 'warning' : 'true'"
  />
  <div v-if="deadlineDate" class="space-y-2">
    <div 
      class="p-2 rounded text-sm"
      :class="{
        'bg-red-50 text-red-700': deadlineDate.diff(DateTime.now(), 'days').days < 7,
        'bg-yellow-50 text-yellow-700': deadlineDate.diff(DateTime.now(), 'days').days >= 7 && deadlineDate.diff(DateTime.now(), 'days').days < 14,
        'bg-green-50 text-green-700': deadlineDate.diff(DateTime.now(), 'days').days >= 14
      }"
    >
      <strong>Timeline:</strong> {{ Math.ceil(deadlineDate.diff(DateTime.now(), 'days').days) }} days remaining
      <div class="text-xs mt-1">
        {{ deadlineDate.diff(DateTime.now(), 'days').days < 14 ? '⚠️ Tight deadline' : '✅ Reasonable timeline' }}
      </div>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const deadline = ref(null);
const minDate = DateTime.now().plus({ days: 7 });

const timelineStatus = computed(() => {
  if (!deadline.value) return null;
  const days = deadline.value.diff(DateTime.now(), 'days').days;
  if (days < 7) return 'urgent';
  if (days < 14) return 'warning';
  return 'good';
});
</script>

<template>
  <ViSimpleDate
    v-model="deadline"
    title="Project Deadline"
    :min="minDate"
    :status="timelineStatus === 'warning' ? 'warning' : 'true'"
  />
</template>
```

### Event Planning

Event date with both calendar types available.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h4 class="font-medium">🎉 Event Planning</h4>
  <ViSimpleDate 
    v-model="eventDate" 
    title="Event Date / تاریخ رویداد"
    calender="both"
    activeCalender="gregorian"
    :min="DateTime.now().plus({ weeks: 2 })"
    placeholder="Select event date / انتخاب تاریخ رویداد"
  />
  <div v-if="eventDate" class="p-3 bg-purple-50 rounded">
    <div class="text-sm space-y-1">
      <div><strong>Gregorian:</strong> {{ eventDate.toFormat('EEEE, MMMM dd, yyyy') }}</div>
      <div><strong>Persian:</strong> {{ eventDate.toFormat('EEEE، d MMMM yyyy', { calendar: 'persian' }) }}</div>
      <div class="text-xs text-gray-600 mt-2">
        Planning time: {{ Math.ceil(eventDate.diff(DateTime.now(), 'weeks').weeks) }} weeks
      </div>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const eventDate = ref(null);
const minEventDate = DateTime.now().plus({ weeks: 2 });
</script>

<template>
  <ViSimpleDate
    v-model="eventDate"
    title="Event Date"
    calender="both"
    activeCalender="gregorian"
    :min="minEventDate"
  />
</template>
```

## Advanced Usage

### Date Range Selection

Creating start and end date selectors.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h4 class="font-medium">📊 Date Range Selection</h4>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <ViSimpleDate 
      v-model="rangeStartDate" 
      title="Start Date"
      :max="rangeEndDate || DateTime.now().plus({ years: 1 })"
      placeholder="Select start date"
    />
    <ViSimpleDate 
      v-model="rangeEndDate" 
      title="End Date"
      :min="rangeStartDate || DateTime.now()"
      placeholder="Select end date"
    />
  </div>
  <div v-if="rangeStartDate && rangeEndDate" class="p-3 bg-green-50 rounded">
    <div class="text-sm">
      <strong>Duration:</strong> {{ Math.ceil(rangeEndDate.diff(rangeStartDate, 'days').days) }} days
    </div>
    <div class="text-xs text-gray-600 mt-1">
      From {{ rangeStartDate.toFormat('MMM dd') }} to {{ rangeEndDate.toFormat('MMM dd, yyyy') }}
    </div>
  </div>
</div>
:::

```vue
<script setup>
const startDate = ref(null);
const endDate = ref(null);

const duration = computed(() => {
  if (!startDate.value || !endDate.value) return null;
  return Math.ceil(endDate.value.diff(startDate.value, 'days').days);
});
</script>

<template>
  <ViSimpleDate v-model="startDate" title="Start Date" :max="endDate" />
  <ViSimpleDate v-model="endDate" title="End Date" :min="startDate" />
</template>
```

## Tips

- **Luxon Objects**: Always use DateTime objects from Luxon, not JavaScript Date
- **Null Values**: Initialize with `null` for empty date pickers
- **Min/Max**: Use DateTime objects for date constraints
- **Calendar Types**: Choose between 'persian' and 'gregorian' based on user needs
- **Validation**: Combine status props with computed validation logic
- **Accessibility**: Component includes full keyboard navigation and ARIA support
- **Localization**: Persian calendar automatically handles RTL and Persian numerals
- **Performance**: DateTime objects are immutable and performant for date operations
