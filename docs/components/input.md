# ViInput Examples

Interactive examples demonstrating the ViInput component features.

<script setup>
import { ref } from 'vue'
import ViInput from '../../src/components/ViInput.vue'
import { Icon } from "@iconify/vue";

// Basic examples
const simpleInput = ref('')
const titleInput = ref('')
const placeholderInput = ref('')

// Status examples
const errorInput = ref('')
const warningInput = ref('')
const successInput = ref('')

// State examples
const disabledInput = ref('Disabled value')
const readonlyInput = ref('Read-only value')

// Type examples
const passwordInput = ref('')
const emailInput = ref('')
const numberInput = ref(0)
const textNumberInput = ref('')
const formattedNumberInput = ref('')

// Datalist examples
const htmlDatalistInput = ref('')
const customDatalistInput = ref('')

// Slot examples
const priceInput = ref('')
const searchInput = ref('')

// Custom examples
const phoneInput = ref('')
const urlInput = ref('')

// Data arrays
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France']
const currencies = ['USD', 'EUR', 'GBP', 'JPY']
</script>

## Basic Usage

### Simple Input with Placeholder

Basic input without title, only placeholder.

::: raw
<ViInput 
  v-model="placeholderInput" 
  placeholder="Enter your text here" 
/>
:::

```vue
<ViInput v-model="value" placeholder="Enter your text here" />
```

### Input with Title

Standard input with floating title label.

::: raw
<ViInput 
  v-model="titleInput" 
  title="Full Name" 
  placeholder="Enter your full name" 
/>
:::

```vue
<ViInput v-model="value" title="Full Name" placeholder="Enter your full name" />
```

## Status Indicators

### Error Status

::: raw
<ViInput 
  v-model="errorInput" 
  title="Email" 
  status="error"
  placeholder="invalid@email" 
/>
:::

```vue
<ViInput
  v-model="value"
  title="Email"
  status="error"
  placeholder="invalid@email"
/>
```

### Warning Status

::: raw
<ViInput 
  v-model="warningInput" 
  title="Username" 
  status="warning"
  placeholder="insert user name" 
/>
:::

```vue
<ViInput
  v-model="value"
  title="Username"
  status="warning"
  placeholder="insert user name"
/>
```

### Success Status

::: raw
<ViInput 
  v-model="successInput" 
  title="Password" 
  status="true"
  placeholder="strong password" 
/>
:::

```vue
<ViInput v-model="value" title="Password" status="true" />
```

## Input States

### Disabled Input

::: raw
<ViInput 
  v-model="disabledInput" 
  title="Disabled Field" 
  disabled 
/>
:::

```vue
<ViInput v-model="value" title="Disabled Field" disabled />
```

### Read-only Input

::: raw
<ViInput 
  v-model="readonlyInput" 
  title="Read-only Field" 
  readonly 
/>
:::

```vue
<ViInput v-model="value" title="Read-only Field" readonly />
```

## Input Types

### Password Input

Includes show/hide password toggle.

::: raw
<ViInput 
  v-model="passwordInput" 
  title="Password" 
  type="password"
  placeholder="Enter password" 
/>
:::

```vue
<ViInput v-model="value" title="Password" type="password" />
```

### Email Input

::: raw
<ViInput 
  v-model="emailInput" 
  title="Email Address" 
  type="email"
  placeholder="user@example.com" 
/>
:::

```vue
<ViInput v-model="value" title="Email Address" type="email" />
```

### Number Input

::: raw
<ViInput 
  v-model="numberInput" 
  title="Age" 
  type="number"
  min="0"
  max="120"
/>
:::

```vue
<ViInput v-model="value" title="Age" type="number" :min="0" :max="120" />
```

## Number Handling

### Text Input with Number Accept

Only allows numeric input but stores as text.

::: raw
<ViInput 
  v-model="textNumberInput" 
  title="Phone Number" 
  accept="number"
  placeholder="1234567890" 
/>
:::

```vue
<ViInput v-model="value" title="Phone Number" accept="number" />
```

### Formatted Number Input

Automatically formats numbers with commas.

::: raw
<ViInput 
  v-model="formattedNumberInput" 
  title="Price" 
  accept="number"
  format
  placeholder="10000" 
/>
:::

```vue
<ViInput v-model="value" title="Price" accept="number" format />
```

## Datalist Options

### HTML Datalist

Using browser's native datalist.

::: raw

<div>
  <datalist id="browsers">
    <option value="Chrome"/>
    <option value="Firefox"/>
    <option value="Safari"/>
    <option value="Edge"/>
  </datalist>
  <ViInput 
    v-model="htmlDatalistInput" 
    title="Browser" 
    list="browsers"
    placeholder="Choose or type browser name" 
  />
</div>
:::

```vue
<template>
  <datalist id="browsers">
    <option value="Chrome"></option>
    <option value="Firefox"></option>
    <option value="Safari"></option>
    <option value="Edge"></option>
  </datalist>
  <ViInput v-model="value" title="Browser" list="browsers" />
</template>
```

### Custom Datalist

Custom dropdown with filtering.

::: raw
<ViInput 
  v-model="customDatalistInput" 
  title="Country" 
  :datalist="countries"
  placeholder="Type or select country" 
/>
:::

```vue
<script setup>
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France'];
</script>

<template>
  <ViInput v-model="value" title="Country" :datalist="countries" />
</template>
```

## Slot Usage

### Before and After Slots

Perfect for currency, units, or action buttons.

::: raw
<ViInput v-model="priceInput" type="number" placeholder="0.00">
<template #before>
<span>price</span>
</template>
<template #after>
<span>USD</span>
</template>
</ViInput>
:::

```vue
<ViInput v-model="priceInput" type="number" placeholder="0.00">
  <template #before>
    <span>price</span>
  </template>
  <template #after>
    <span>USD</span>
  </template>
</ViInput>
```

### Search Input with Icon

::: raw
<ViInput
v-model="searchInput"
title="Search"
type="search"
placeholder="Search products...">
<template #before><Icon icon="hugeicons:search-01" height="32" /></template>
</ViInput>
:::

```vue
<ViInput
  v-model="searchInput"
  title="Search"
  type="search"
  placeholder="Search products..."
>
  <template #before><Icon icon="hugeicons:search-01" height="32" /></template>
</ViInput>
```

## Advanced Examples

### Phone Number Input

::: raw
<ViInput
    v-model="phoneInput"
    title="Phone Number"
    type="tel"
    inputDir="ltr"
    accept="number"
    placeholder="+1 (555) 000-0000">
<template #before>
<span>📞</span>
</template>
</ViInput>
:::

```vue
<ViInput
  v-model="phoneInput"
  title="Phone Number"
  type="tel"
  inputDir="ltr"
  accept="number"
  placeholder="+1 (555) 000-0000"
>
    <template #before>
      <span>📞</span>
    </template>
  </ViInput>
```

### URL Input

::: raw
<ViInput
v-model="urlInput"
title="Website"
type="url"
placeholder="https://example.com">
<template #before>
<span>🌐</span>
</template>
</ViInput>
:::

## Required and Validation

### Required Field

::: raw
<ViInput 
  v-model="simpleInput" 
  title="Required Field" 
  required
  placeholder="This field is required" 
/>
:::

```vue
<ViInput v-model="value" title="Required Field" required />
```

### Input with Length Limits

::: raw
<ViInput 
  v-model="simpleInput" 
  title="Short Text" 
  :maxlength="10"
  :minlength="3"
  placeholder="3-10 characters" 
/>
:::

```vue
<ViInput v-model="value" title="Short Text" :maxlength="10" :minlength="3" />
```

## Tips

- Use `accept="number"` for numeric text inputs that need to remain as strings
- Use `format` prop with `accept="number"` for automatic number formatting
- Combine slots for complex input designs like currency or measurement inputs
- Use appropriate input types for better mobile keyboard experience
- The `inputDir` prop is useful for RTL/LTR content in mixed-direction layouts
