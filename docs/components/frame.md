# ViFrame Examples

Interactive examples demonstrating how to combine multiple components within a single frame using ViFrame and the `noFrame` prop.

<script setup>
import { ref } from 'vue'
import ViFrame from '../../src/components/base/ViFrame.vue'
import ViInput from '../../src/components/ViInput.vue'
import ViSelect from '../../src/components/ViSelect.vue'
import ViCheckSlider from '../../src/components/ViCheckSlider.vue'
import ViDivider from '../../src/components/parts/ViDivider.vue'

// Example 1: Two inputs
const firstName = ref('')
const lastName = ref('')

// Example 2: Input and select
const name = ref('')
const country = ref('')

// Example 3: Input and checkbox slider
const email = ref('')
const notifications = ref(false)

// Data
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France', 'Japan']
</script>

## What is ViFrame?

ViFrame is a **layout component** that provides a visual container (border, background, padding) that wraps around form components. When you want to **group multiple components within a single frame**, you can:

1. **Disable individual frames** using `noFrame` prop on each component
2. **Wrap them in ViFrame** to create a unified container
3. **Organize related fields** within logical groupings

## Examples

### Two ViInput Components

Combine first name and last name in a single frame.

::: raw
<div class="space-y-4">
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="firstName" title="First Name" placeholder="Enter first name" noFrame />
    <ViDivider/>
    <ViInput v-model="lastName" title="Last Name" placeholder="Enter last name" noFrame />
  </ViFrame>
  <div class="text-sm text-gray-600">
    Full Name: {{ firstName }} {{ lastName }}
  </div>
</div>
:::

```vue
<script setup>
const firstName = ref('')
const lastName = ref('')
</script>

<template>
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="firstName" title="First Name" placeholder="Enter first name" noFrame />
    <ViDivider/>
    <ViInput v-model="lastName" title="Last Name" placeholder="Enter last name" noFrame />
  </ViFrame>
</template>
```

### ViInput and ViSelect

Combine text input with dropdown selection.

::: raw
<div class="space-y-4">
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="name" title="Your Name" placeholder="Enter your name" noFrame />
    <ViDivider/>
    <ViSelect v-model="country" :options="countries" title="Country" noFrame>
      <template #option="{ option }">{{ option }}</template>
      <template #label="{ selected }">
        <span v-if="selected">{{ selected }}</span>
        <span v-else class="text-gray-400">Select country</span>
      </template>
    </ViSelect>
  </ViFrame>
  <div class="text-sm text-gray-600">
    User: {{ name }} from {{ country }}
  </div>
</div>
:::

```vue
<script setup>
const name = ref('')
const country = ref('')
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France', 'Japan']
</script>

<template>
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="name" title="Your Name" placeholder="Enter your name" noFrame />
    <ViDivider/>
    <ViSelect v-model="country" :options="countries" title="Country" noFrame>
      <template #option="{ option }">{{ option }}</template>
      <template #label="{ selected }">
        <span v-if="selected">{{ selected }}</span>
        <span v-else>Select country</span>
      </template>
    </ViSelect>
  </ViFrame>
</template>
```

### ViInput and ViCheckSlider

Combine text input with toggle switch.

::: raw
<div class="space-y-4">
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="email" title="Email Address" type="email" placeholder="your@email.com" noFrame />
    <ViDivider/>
    <ViCheckSlider v-model="notifications" title="Email Notifications" noFrame />
  </ViFrame>
  <div class="text-sm text-gray-600">
    Email: {{ email }} | Notifications: {{ notifications ? 'Enabled' : 'Disabled' }}
  </div>
</div>
:::

```vue
<script setup>
const email = ref('')
const notifications = ref(false)
</script>

<template>
  <ViFrame class="px-2 gap-2">
    <ViInput v-model="email" title="Email Address" type="email" placeholder="your@email.com" noFrame />
    <ViDivider/>
    <ViCheckSlider v-model="notifications" title="Email Notifications" noFrame />
  </ViFrame>
</template>
```

## Key Features

- **Visual Grouping** - Related fields appear as a cohesive unit
- **Cleaner Interface** - Single border instead of multiple borders
- **Logical Organization** - Group related information together
- **Consistent Styling** - Unified border and padding for the entire group

## Usage Guidelines

- **Use `noFrame` prop** on all components inside ViFrame
- **Use `ViDivider`** component between components for visual separation
- **Add `class="px-2 gap-2"`** to ViFrame for proper spacing
- **Use `autoHeight` prop** when content height varies

```vue
<ViFrame class="px-2 gap-2">
  <ViInput v-model="value1" title="Field 1" noFrame />
  <ViDivider/>
  <ViInput v-model="value2" title="Field 2" noFrame />
</ViFrame>
```
