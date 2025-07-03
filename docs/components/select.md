# ViSelect Examples

Interactive examples demonstrating the ViSelect component features.

<script setup>
import { ref } from 'vue'
import ViSelect from '../../src/components/ViSelect.vue'
import { Icon } from "@iconify/vue";

// Basic examples
const simpleSelect = ref(null)
const titleSelect = ref(null)
const placeholderSelect = ref(null)

// Status examples
const errorSelect = ref(null)
const warningSelect = ref(null)
const successSelect = ref(null)

// State examples
const disabledSelect = ref('Option 1')
const readonlySelect = ref('Option 2')

// Multiple selection
const multipleSelect = ref([])
const multipleCountries = ref([])

// Search and filter
const searchSelect = ref(null)
const filterSelect = ref(null)
const customFilterSelect = ref(null)

// Object options
const userSelect = ref(null)
const productSelect = ref(null)
const customCompareSelect = ref(null)

// Data arrays
const basicOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'Brazil']
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' }
]
const products = [
  { code: 'P001', name: 'Laptop', category: 'Electronics', price: 999 },
  { code: 'P002', name: 'Mouse', category: 'Electronics', price: 25 },
  { code: 'P003', name: 'Keyboard', category: 'Electronics', price: 75 },
  { code: 'P004', name: 'Monitor', category: 'Electronics', price: 299 }
]
</script>

## Basic Usage

### Simple Select without Title

Basic select dropdown without title label.

::: raw
<ViSelect 
  v-model="simpleSelect" 
  :options="basicOptions"
  placeholder="Choose an option" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Choose an option</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  placeholder="Choose an option" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Choose an option</span>
  </template>
</ViSelect>
```

### Select with Title

Standard select with floating title label.

::: raw
<ViSelect 
  v-model="titleSelect" 
  :options="countries"
  title="Country" 
  placeholder="Select your country" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Select your country</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="countries"
  title="Country" 
  placeholder="Select your country" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Select your country</span>
  </template>
</ViSelect>
```

## Status Indicators

### Error Status

::: raw
<ViSelect 
  v-model="errorSelect" 
  :options="basicOptions"
  title="Required Field" 
  status="error"
  placeholder="This field has an error" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">This field has an error</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Required Field" 
  status="error" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>This field has an error</span>
  </template>
</ViSelect>
```

### Warning Status

::: raw
<ViSelect 
  v-model="warningSelect" 
  :options="countries"
  title="Country Selection" 
  status="warning"
  placeholder="Please verify your choice" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Please verify your choice</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="countries"
  title="Country Selection" 
  status="warning" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Please verify your choice</span>
  </template>
</ViSelect>
```

### Success Status

::: raw
<ViSelect 
  v-model="successSelect" 
  :options="basicOptions"
  title="Validated Field" 
  status="true"
  placeholder="Selection validated" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Selection validated</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Validated Field" 
  status="true" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Selection validated</span>
  </template>
</ViSelect>
```

## Select States

### Disabled Select

::: raw
<ViSelect 
  v-model="disabledSelect" 
  :options="basicOptions"
  title="Disabled Field" 
  disabled 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Disabled field</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Disabled Field" 
  disabled 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Disabled field</span>
  </template>
</ViSelect>
```

### Read-only Select

::: raw
<ViSelect 
  v-model="readonlySelect" 
  :options="basicOptions"
  title="Read-only Field" 
  readonly 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Read-only field</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Read-only Field" 
  readonly 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Read-only field</span>
  </template>
</ViSelect>
```

## Multiple Selection

### Basic Multiple Select

::: raw
<ViSelect 
  v-model="multipleSelect" 
  :options="basicOptions"
  title="Multiple Options" 
  multiple
  placeholder="Select multiple options" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected && selected.length">{{ selected.join(', ') }}</span>
    <span v-else class="text-gray-400">Select multiple options</span>
  </template>
</ViSelect>
<div class="mt-2 text-sm text-gray-600">
  Selected: {{ multipleSelect.length ? multipleSelect.join(', ') : 'None' }}
</div>
:::

```vue
<ViSelect 
  v-model="selectedItems" 
  :options="options"
  title="Multiple Options" 
  multiple
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected && selected.length">{{ selected.join(', ') }}</span>
    <span v-else>Select multiple options</span>
  </template>
</ViSelect>
```

### Multiple Countries

::: raw
<ViSelect 
  v-model="multipleCountries" 
  :options="countries"
  title="Countries Visited" 
  multiple
  placeholder="Select countries you've visited" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected && selected.length">{{ selected.length }} countries selected</span>
    <span v-else class="text-gray-400">Select countries you've visited</span>
  </template>
</ViSelect>
<div class="mt-2 text-sm text-gray-600">
  Selected: {{ multipleCountries.length }} countries
</div>
:::

```vue
<ViSelect 
  v-model="selectedCountries" 
  :options="countries"
  title="Countries Visited" 
  multiple
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected && selected.length">{{ selected.length }} countries</span>
    <span v-else>Select countries</span>
  </template>
</ViSelect>
```

## Client-side Filtering vs Server-side Search

### Client-side Filter - Simple Strings

The `filter` prop enables client-side filtering of existing options. Perfect for static lists.

::: raw
<ViSelect 
  v-model="filterSelect" 
  :options="countries"
  title="Client-side Filter" 
  :filter="true"
  placeholder="Type to filter countries" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Type to filter countries</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="countries"
  title="Client-side Filter" 
  :filter="true"
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Type to filter</span>
  </template>
</ViSelect>
```

### Client-side Filter - Specific Object Fields

For object arrays, specify which fields to filter using dot notation.

::: raw
<ViSelect 
  v-model="customFilterSelect" 
  :options="users"
  title="Filter by Name & Email" 
  :filter="['name', 'email']"
  placeholder="Search by name or email" 
>
  <template #option="{ option }">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
        {{ option.name.charAt(0) }}
      </div>
      <div>
        <div class="font-medium">{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.email }}</div>
      </div>
    </div>
  </template>
  <template #label="{ selected }">
    <div v-if="selected" class="flex items-center gap-2">
      <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
        {{ selected.name.charAt(0) }}
      </div>
      <span>{{ selected.name }}</span>
    </div>
    <span v-else class="text-gray-400">Search by name or email</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="selectedUser" 
  :options="users"
  title="Filter by Name & Email" 
  :filter="['name', 'email']"
>
  <template #option="{ option }">
    <div class="flex items-center gap-3">
      <div>{{ option.name }}</div>
      <div class="text-sm">{{ option.email }}</div>
    </div>
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected.name }}</span>
    <span v-else>Search users</span>
  </template>
</ViSelect>
```

### Server-side Search

The `search` prop enables server-side searching - perfect for API calls and dynamic data.

::: raw
<div>
  <ViSelect 
    v-model="searchSelect" 
    :options="countries"
    title="Server-side Search" 
    search
    @search="(term) => console.log('API Search term:', term)"
    placeholder="Search triggers API call" 
  >
    <template #option="{ option }">
      {{ option }}
    </template>
    <template #label="{ selected }">
      <span v-if="selected">{{ selected }}</span>
      <span v-else class="text-gray-400">Search triggers API call</span>
    </template>
  </ViSelect>
  <div class="mt-2 text-sm text-gray-600">
    Check console for search events - use this for API calls
  </div>
</div>
:::

```vue
<script setup>
async function handleSearch(searchTerm) {
  // Make API call with search term
  const response = await fetch(`/api/search?q=${searchTerm}`)
  const results = await response.json()
  // Update options with search results
  options.value = results
}
</script>

<template>
  <ViSelect 
    v-model="value" 
    :options="options"
    title="Server-side Search" 
    search
    @search="handleSearch"
  >
    <template #option="{ option }">
      {{ option }}
    </template>
    <template #label="{ selected }">
      <span v-if="selected">{{ selected }}</span>
      <span v-else>Search with API</span>
    </template>
  </ViSelect>
</template>
```

## Object Options

### User Selection with Custom Display

::: raw
<ViSelect 
  v-model="userSelect" 
  :options="users"
  title="Select User" 
  compareKey="id"
  placeholder="Choose a user" 
>
  <template #option="{ option }">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {{ option.name.charAt(0) }}
        </div>
        <div>
          <div class="font-medium">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.email }}</div>
        </div>
      </div>
      <div class="text-xs bg-gray-100 px-2 py-1 rounded">{{ option.role }}</div>
    </div>
  </template>
  <template #label="{ selected }">
    <div v-if="selected" class="flex items-center gap-2">
      <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
        {{ selected.name.charAt(0) }}
      </div>
      <span>{{ selected.name }} ({{ selected.role }})</span>
    </div>
    <span v-else class="text-gray-400">Choose a user</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="selectedUser" 
  :options="users"
  title="Select User" 
  compareKey="id"
>
  <template #option="{ option }">
    <div class="flex items-center gap-3">
      <div class="avatar">{{ option.name.charAt(0) }}</div>
      <div>
        <div>{{ option.name }}</div>
        <div class="text-sm">{{ option.email }}</div>
      </div>
    </div>
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected.name }}</span>
    <span v-else>Select a user</span>
  </template>
</ViSelect>
```

### Product Selection

::: raw
<ViSelect 
  v-model="productSelect" 
  :options="products"
  title="Select Product" 
  compareKey="code"
  :filter="['name', 'category']"
  placeholder="Search products..." 
>
  <template #option="{ option }">
    <div class="flex items-center justify-between">
      <div>
        <div class="font-medium">{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.category }} • Code: {{ option.code }}</div>
      </div>
      <div class="text-right">
        <div class="font-bold text-green-600">${{ option.price }}</div>
      </div>
    </div>
  </template>
  <template #label="{ selected }">
    <div v-if="selected" class="flex items-center justify-between w-full">
      <span>{{ selected.name }}</span>
      <span class="text-green-600 font-bold">${{ selected.price }}</span>
    </div>
    <span v-else class="text-gray-400">Search products...</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="selectedProduct" 
  :options="products"
  title="Select Product" 
  compareKey="code"
  :filter="['name', 'category']"
>
  <template #option="{ option }">
    <div class="flex justify-between">
      <div>
        <div>{{ option.name }}</div>
        <div class="text-sm">{{ option.category }}</div>
      </div>
      <div>${{ option.price }}</div>
    </div>
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected.name }}</span>
    <span v-else>Select a product</span>
  </template>
</ViSelect>
```

### Custom Compare Key

Using different comparison field for object matching.

::: raw
<ViSelect 
  v-model="customCompareSelect" 
  :options="products"
  title="Select by Code" 
  compareKey="code"
  placeholder="Products compared by code" 
>
  <template #option="{ option }">
    <div>
      <div class="font-medium">{{ option.code }} - {{ option.name }}</div>
      <div class="text-sm text-gray-500">Category: {{ option.category }}</div>
    </div>
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected.code }} - {{ selected.name }}</span>
    <span v-else class="text-gray-400">Products compared by code</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="selected" 
  :options="products"
  title="Select by Code" 
  compareKey="code"
>
  <template #option="{ option }">
    {{ option.code }} - {{ option.name }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected.code }} - {{ selected.name }}</span>
    <span v-else>Select by code</span>
  </template>
</ViSelect>
```

## Advanced Features

### Full Popup Width

::: raw
<ViSelect 
  v-model="simpleSelect" 
  :options="countries"
  title="Full Width Popup" 
  fullPopup
  placeholder="Popup matches select width" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Popup matches select width</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="countries"
  title="Full Width Popup" 
  fullPopup
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Full width popup</span>
  </template>
</ViSelect>
```

### Required Field

::: raw
<ViSelect 
  v-model="simpleSelect" 
  :options="basicOptions"
  title="Required Selection" 
  required
  placeholder="This field is required" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">This field is required</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Required Selection" 
  required
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Required field</span>
  </template>
</ViSelect>
```

### No Frame Style

::: raw
<ViSelect 
  v-model="simpleSelect" 
  :options="basicOptions"
  title="No Frame Select" 
  noFrame
  placeholder="Borderless style" 
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else class="text-gray-400">Borderless style</span>
  </template>
</ViSelect>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="No Frame Select" 
  noFrame
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Borderless style</span>
  </template>
</ViSelect>
```

## Event Handling

### Change Event

::: raw
<div>
  <ViSelect 
    v-model="titleSelect" 
    :options="countries"
    title="Change Event" 
    @change="() => console.log('Selection changed to:', titleSelect)"
    placeholder="Selection triggers change event" 
  >
    <template #option="{ option }">
      {{ option }}
    </template>
    <template #label="{ selected }">
      <span v-if="selected">{{ selected }}</span>
      <span v-else class="text-gray-400">Selection triggers change event</span>
    </template>
  </ViSelect>
  <div class="mt-2 text-sm text-gray-600">
    Selected: {{ titleSelect || 'None' }}
  </div>
</div>
:::

```vue
<ViSelect 
  v-model="value" 
  :options="options"
  title="Change Event" 
  @change="handleChange"
>
  <template #option="{ option }">
    {{ option }}
  </template>
  <template #label="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Select option</span>
  </template>
</ViSelect>
```

## Tips

- **Required**: Always use both `#option` and `#label` templates for proper functionality
- **Filter vs Search**: Use `filter` for client-side filtering of static data, `search` for server-side API calls
- **Object Filtering**: Use `filter={['field1', 'field2']}` to filter specific object properties
- **Dot Notation**: Filter supports nested properties like `filter={['user.name', 'user.email']}`
- Use `multiple` prop for multi-selection functionality
- Use `compareKey` for object options to specify which field to use for comparison
- The `fullPopup` prop makes the dropdown match the width of the select input
- Combine slots with filtering for rich, searchable option displays
- Use appropriate `compareKey` when working with object arrays to ensure proper selection matching
