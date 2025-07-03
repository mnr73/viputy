# ViSelectPopup Examples

Interactive examples demonstrating the ViSelectPopup component features.

<script setup>
import { ref } from 'vue'
import ViSelectPopup from '../../src/components/ViSelectPopup.vue'
import { Icon } from "@iconify/vue";

// Basic examples
const simpleSelect = ref(null)
const multipleSelect = ref([])

// Single selection examples
const userSelect = ref(null)
const productSelect = ref(null)
const countrySelect = ref(null)

// Multiple selection examples
const multipleUsers = ref([])
const multipleProducts = ref([])
const multipleCountries = ref([])

// Disabled state
const disabledSelect = ref('Option 1')

// Data arrays
const basicOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']
const countries = ['Iran', 'USA', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'Brazil']

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', department: 'IT' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', department: 'HR' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', department: 'Sales' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', department: 'Marketing' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', department: 'IT' }
]

const products = [
  { id: 'P001', name: 'Laptop Pro', category: 'Electronics', price: 1299, brand: 'TechCorp' },
  { id: 'P002', name: 'Wireless Mouse', category: 'Electronics', price: 29, brand: 'TechCorp' },
  { id: 'P003', name: 'Mechanical Keyboard', category: 'Electronics', price: 89, brand: 'KeyMaster' },
  { id: 'P004', name: '4K Monitor', category: 'Electronics', price: 399, brand: 'ViewMax' },
  { id: 'P005', name: 'USB-C Hub', category: 'Electronics', price: 79, brand: 'ConnectAll' }
]
</script>

## Basic Usage

### Simple String Options

Basic popup select with string options.

::: raw
<ViSelectPopup 
  v-model="simpleSelect" 
  :options="basicOptions"
>
  <template #text="{ selected }">
    <span v-if="selected">Selected: {{ selected }}</span>
    <span v-else class="text-gray-400">Choose an option</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="value" 
  :options="options"
>
  <template #text="{ selected }">
    <span v-if="selected">Selected: {{ selected }}</span>
    <span v-else>Choose an option</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
```

### With Custom Icon

Using custom icon slot instead of default dropdown arrow.

::: raw
<ViSelectPopup 
  v-model="countrySelect" 
  :options="countries"
>
  <template #icon="{ open }">
    <Icon 
      :icon="open ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
      class="w-5 h-5 text-blue-500" 
    />
  </template>
  <template #text="{ selected }">
    <span v-if="selected" class="flex items-center gap-2">
      🌍 {{ selected }}
    </span>
    <span v-else class="text-gray-400">Select country</span>
  </template>
  <template #option="{ option }">
    <div class="p-2 hover:bg-blue-50">🌍 {{ option }}</div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="value" 
  :options="countries"
>
  <template #icon="{ open }">
    <Icon :icon="open ? 'chevron-up' : 'chevron-down'" />
  </template>
  <template #text="{ selected }">
    <span v-if="selected">🌍 {{ selected }}</span>
    <span v-else>Select country</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">🌍 {{ option }}</div>
  </template>
</ViSelectPopup>
```

## Single Selection with Objects

### User Selection

Single user selection with object comparison.

::: raw
<ViSelectPopup 
  v-model="userSelect" 
  :options="users"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="flex items-center gap-3">
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
        {{ selected.name.charAt(0) }}
      </div>
      <div>
        <div class="font-medium">{{ selected.name }}</div>
        <div class="text-xs text-gray-500">{{ selected.role }} - {{ selected.department }}</div>
      </div>
    </div>
    <span v-else class="text-gray-400">Select a user</span>
  </template>
  <template #option="{ option }">
    <div class="flex items-center gap-3 p-3 hover:bg-gray-50">
      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
        {{ option.name.charAt(0) }}
      </div>
      <div class="flex-1">
        <div class="font-medium">{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.email }}</div>
        <div class="text-xs text-gray-400">{{ option.role }} - {{ option.department }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="selectedUser" 
  :options="users"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="flex items-center gap-2">
      <div class="avatar">{{ selected.name.charAt(0) }}</div>
      <span>{{ selected.name }}</span>
    </div>
    <span v-else>Select a user</span>
  </template>
  <template #option="{ option }">
    <div class="flex items-center gap-3 p-3">
      <div class="avatar">{{ option.name.charAt(0) }}</div>
      <div>
        <div>{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.email }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
```

### Product Selection

Product selection with detailed display.

::: raw
<ViSelectPopup 
  v-model="productSelect" 
  :options="products"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="flex items-center justify-between w-full">
      <div>
        <span class="font-medium">{{ selected.name }}</span>
        <span class="text-sm text-gray-500 ml-2">by {{ selected.brand }}</span>
      </div>
      <span class="font-bold text-green-600">${{ selected.price }}</span>
    </div>
    <span v-else class="text-gray-400">Select a product</span>
  </template>
  <template #option="{ option }">
    <div class="p-3 hover:bg-gray-50">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.category }} by {{ option.brand }}</div>
          <div class="text-xs text-gray-400">ID: {{ option.id }}</div>
        </div>
        <div class="text-right">
          <div class="font-bold text-green-600">${{ option.price }}</div>
        </div>
      </div>
    </div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="selectedProduct" 
  :options="products"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="flex justify-between">
      <span>{{ selected.name }}</span>
      <span class="text-green-600">${{ selected.price }}</span>
    </div>
    <span v-else>Select a product</span>
  </template>
  <template #option="{ option }">
    <div class="p-3">
      <div class="flex justify-between">
        <div>
          <div>{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.category }}</div>
        </div>
        <div>${{ option.price }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
```

## Multiple Selection

### Multiple String Selection

Multiple selection with string options.

::: raw
<ViSelectPopup 
  v-model="multipleCountries" 
  :options="countries"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length" class="flex items-center gap-2">
      <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
        {{ selected.length }} selected
      </span>
      <span class="text-sm text-gray-600">
        {{ selected.slice(0, 2).join(', ') }}{{ selected.length > 2 ? ` +${selected.length - 2} more` : '' }}
      </span>
    </div>
    <span v-else class="text-gray-400">Select countries</span>
  </template>
  <template #option="{ option }">
    <div class="p-2 hover:bg-gray-50">{{ option }}</div>
  </template>
</ViSelectPopup>
<div class="mt-2 text-sm text-gray-600">
  Selected: {{ multipleCountries.length ? multipleCountries.join(', ') : 'None' }}
</div>
:::

```vue
<ViSelectPopup 
  v-model="selectedCountries" 
  :options="countries"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length">
      <span>{{ selected.length }} countries selected</span>
    </div>
    <span v-else>Select countries</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
```

### Multiple Users Selection

Multiple user selection with object comparison.

::: raw
<ViSelectPopup 
  v-model="multipleUsers" 
  :options="users"
  compareKey="id"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length" class="flex items-center gap-2">
      <div class="flex -space-x-2">
        <div 
          v-for="(user, index) in selected.slice(0, 3)" 
          :key="user.id"
          class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
        >
          {{ user.name.charAt(0) }}
        </div>
        <div 
          v-if="selected.length > 3"
          class="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
        >
          +{{ selected.length - 3 }}
        </div>
      </div>
      <span class="text-sm">
        {{ selected.length }} user{{ selected.length !== 1 ? 's' : '' }} selected
      </span>
    </div>
    <span v-else class="text-gray-400">Select team members</span>
  </template>
  <template #option="{ option }">
    <div class="flex items-center gap-3 p-3 hover:bg-gray-50">
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
        {{ option.name.charAt(0) }}
      </div>
      <div>
        <div class="font-medium">{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.role }} - {{ option.department }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
<div class="mt-2 text-sm text-gray-600">
  Selected: {{ multipleUsers.map(u => u.name).join(', ') || 'None' }}
</div>
:::

```vue
<ViSelectPopup 
  v-model="selectedUsers" 
  :options="users"
  compareKey="id"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length">
      <span>{{ selected.length }} users selected</span>
    </div>
    <span v-else>Select team members</span>
  </template>
  <template #option="{ option }">
    <div class="flex items-center gap-3 p-3">
      <div class="avatar">{{ option.name.charAt(0) }}</div>
      <div>
        <div>{{ option.name }}</div>
        <div class="text-sm">{{ option.role }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
```

### Multiple Products Selection

Multiple product selection with detailed view.

::: raw
<ViSelectPopup 
  v-model="multipleProducts" 
  :options="products"
  compareKey="id"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length" class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
          {{ selected.length }} items
        </span>
        <span class="text-sm text-gray-600">in cart</span>
      </div>
      <span class="font-bold text-green-600">
        ${{ selected.reduce((sum, product) => sum + product.price, 0) }}
      </span>
    </div>
    <span v-else class="text-gray-400">Add products to cart</span>
  </template>
  <template #option="{ option }">
    <div class="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.brand }} • {{ option.category }}</div>
        </div>
        <div class="text-right">
          <div class="font-bold text-green-600">${{ option.price }}</div>
        </div>
      </div>
    </div>
  </template>
</ViSelectPopup>
<div class="mt-2 text-sm text-gray-600">
  Cart: {{ multipleProducts.length }} items, Total: ${{ multipleProducts.reduce((sum, p) => sum + p.price, 0) }}
</div>
:::

```vue
<ViSelectPopup 
  v-model="selectedProducts" 
  :options="products"
  compareKey="id"
  multiple
>
  <template #text="{ selected }">
    <div v-if="selected && selected.length">
      <span>{{ selected.length }} products selected</span>
    </div>
    <span v-else>Select products</span>
  </template>
  <template #option="{ option }">
    <div class="p-3">
      <div class="flex justify-between">
        <span>{{ option.name }}</span>
        <span>${{ option.price }}</span>
      </div>
    </div>
  </template>
</ViSelectPopup>
```

## Disabled State

### Disabled Selection

Selection in disabled state.

::: raw
<ViSelectPopup 
  v-model="disabledSelect" 
  :options="basicOptions"
  disabled
>
  <template #text="{ selected }">
    <span v-if="selected" class="text-gray-500">{{ selected }}</span>
    <span v-else class="text-gray-400">Disabled selection</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="value" 
  :options="options"
  disabled
>
  <template #text="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Disabled selection</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
```

## Event Handling

### Change Event

Handling selection changes.

::: raw
<div>
  <ViSelectPopup 
    v-model="simpleSelect" 
    :options="basicOptions"
    @change="() => console.log('Selection changed to:', simpleSelect)"
  >
    <template #text="{ selected }">
      <span v-if="selected">{{ selected }}</span>
      <span v-else class="text-gray-400">Select with change event</span>
    </template>
    <template #option="{ option }">
      <div class="p-2 hover:bg-blue-50">{{ option }}</div>
    </template>
  </ViSelectPopup>
  <div class="mt-2 text-sm text-gray-600">
    Current selection: {{ simpleSelect || 'None' }}
  </div>
</div>
:::

```vue
<ViSelectPopup 
  v-model="value" 
  :options="options"
  @change="handleSelectionChange"
>
  <template #text="{ selected }">
    <span v-if="selected">{{ selected }}</span>
    <span v-else>Select option</span>
  </template>
  <template #option="{ option }">
    <div class="p-2">{{ option }}</div>
  </template>
</ViSelectPopup>
```

## Advanced Styling

### Custom Styled Options

Options with advanced styling and interactions.

::: raw
<ViSelectPopup 
  v-model="userSelect" 
  :options="users"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded">
      <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
        {{ selected.name.charAt(0) }}
      </div>
      <span class="font-medium">{{ selected.name }}</span>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ selected.role }}</span>
    </div>
    <span v-else class="text-gray-400">Choose team member</span>
  </template>
  <template #option="{ option }">
    <div class="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
          {{ option.name.charAt(0) }}
        </div>
        <div class="flex-1">
          <div class="font-semibold text-gray-800 group-hover:text-blue-600">{{ option.name }}</div>
          <div class="text-sm text-gray-500">{{ option.email }}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{{ option.role }}</span>
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{{ option.department }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
</ViSelectPopup>
:::

```vue
<ViSelectPopup 
  v-model="selectedUser" 
  :options="users"
  compareKey="id"
>
  <template #text="{ selected }">
    <div v-if="selected" class="styled-selection">
      <div class="avatar">{{ selected.name.charAt(0) }}</div>
      <span>{{ selected.name }}</span>
    </div>
    <span v-else>Choose team member</span>
  </template>
  <template #option="{ option }">
    <div class="styled-option">
      <div class="avatar">{{ option.name.charAt(0) }}</div>
      <div>
        <div>{{ option.name }}</div>
        <div class="text-sm">{{ option.email }}</div>
      </div>
    </div>
  </template>
</ViSelectPopup>
```

## Tips

- **Required Templates**: Always use both `#text` and `#option` templates for proper functionality
- **Multiple Selection**: Use `multiple` prop for multi-selection with arrays
- **Object Comparison**: Use `compareKey` to specify which object property to use for comparison
- **Disabled State**: Use `disabled` prop to prevent interaction
- **Event Handling**: Use `@change` event to respond to selection changes
- **Icon Customization**: Use `#icon` slot to customize the dropdown indicator
- **Rich Content**: Both templates support complex HTML for rich displays
- **Performance**: For large lists, consider virtualization or server-side pagination
- **Accessibility**: The component includes keyboard navigation and proper ARIA attributes
