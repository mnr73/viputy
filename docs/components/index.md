# Component Architecture

Viputy components are designed with extensibility and customization at their core. Every component is built to be flexible, allowing developers to create wrapper components, extend existing functionality, and build completely custom components while maintaining consistent styling and behavior.

## Design Philosophy

### 🧩 Modular Architecture

Viputy follows a modular approach where components are built using smaller, reusable base components:

- **ViPart** - The foundational wrapper that handles styling, focus states, and popup functionality
- **ViFrame/ViNoFrame** - Layout containers that provide consistent spacing and structure
- **Individual Components** - Each input component extends these base components

### 🎯 Slot-Based Extension

All components heavily utilize Vue's slot system to provide maximum customization flexibility:

```vue
<ViInput title="name" v-model="input1">
  <template #before>
    <span class="text-gray-500">Mr:</span>
  </template>
  <template #after>
    <button @click="input1 = ''" class="bg-blue-500 p-1 rounded-lg text-white">Clear</button>
  </template>
</ViInput>
```

<script setup>
import ViInput from "../../src/components/ViInput.vue"
import {ref} from "vue"

const input1 = ref()
</script>

::: raw
<ViInput title='name' v-model='input1'>
<template #before>
<span class="text-gray-500">Mr:</span>
</template>
<template #after>
<button @click="input1 = ''" class="bg-blue-500 p-1 rounded-lg text-white">Clear</button>
</template>
</ViInput>
:::

## Base Components

### ViPart - The Foundation

`ViPart` is the core component that provides consistent behavior across all inputs:

**Features:**

- Focus state management
- Status indicators (error, warning, success)
- Popup/dropdown positioning
- Hover effects
- Click handling

**Available Slots:**

- `#before` - Content before the main input area
- `#after` - Content after the main input area
- `#main` - The primary input content (with hoverMode data)
- `#popup` - Dropdown/popup content
- `#top` - Content above the component
- `#bottom` - Content below the component

### ViFrame vs ViNoFrame

These components control the visual container:

- **ViFrame** - Provides border, background, and padding
- **ViNoFrame** - Minimal container for borderless designs

## Creating Custom Components

### Example 1: Custom Wrapper Component

Create your own input component by wrapping existing ones:

```vue
<script setup>
import { ViInput } from '@mnr73/viputy';
import { computed } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  required: Boolean,
  helpText: String
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <div class="space-y-1">
    <ViInput
      v-model="value"
      :title="label"
      :required="required"
      v-bind="$attrs"
    >
      <template #before>
        <slot name="icon"></slot>
      </template>
      <template #after>
        <slot name="actions"></slot>
      </template>
    </ViInput>

    <p v-if="helpText" class="text-sm text-gray-600">
      {{ helpText }}
    </p>
  </div>
</template>
```

### Example 2: Extending Base Components

Build completely custom components using ViPart:

```vue
<script setup>
import { ref, computed } from 'vue';
import { ViPart } from '@mnr73/viputy';

const props = defineProps({
  modelValue: Array,
  options: Array,
  title: String
});

const emit = defineEmits(['update:modelValue']);
const focus = ref(false);

const value = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
});

function toggleOption(option) {
  const index = value.value.indexOf(option);
  if (index > -1) {
    value.value.splice(index, 1);
  } else {
    value.value.push(option);
  }
}
</script>

<template>
  <ViPart :focused="focus">
    <template #main="{ hoverMode }">
      <span v-if="title" class="text-sm text-slate-600">
        {{ title }}
      </span>

      <div class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="option in options"
          :key="option"
          @click="toggleOption(option)"
          class="px-3 py-1 rounded-full border transition-colors"
          :class="{
            'bg-blue-500 text-white border-blue-500': value.includes(option),
            'hover:bg-gray-50': !value.includes(option)
          }"
        >
          {{ option }}
        </button>
      </div>
    </template>
  </ViPart>
</template>
```

## Customization Patterns

### 1. Theme Customization

Override default styling while keeping functionality:

```vue
<ViInput v-model="value" title="Custom Styled Input" class="custom-input">
  <style scoped>
  .custom-input :deep(.vi-part) {
    --vi-border-color: theme(colors.purple.300);
    --vi-focus-color: theme(colors.purple.500);
  }
  </style>
</ViInput>
```

### 2. Behavior Extension

Add custom behavior while preserving core functionality:

```vue
<script setup>
import { ViSelect } from '@mnr73/viputy';
import { ref, watch } from 'vue';

const selectedValue = ref(null);
const searchHistory = ref([]);

// Track search history
watch(selectedValue, (newVal) => {
  if (newVal && !searchHistory.value.includes(newVal)) {
    searchHistory.value.unshift(newVal);
    if (searchHistory.value.length > 5) {
      searchHistory.value.pop();
    }
  }
});
</script>

<template>
  <div>
    <ViSelect
      v-model="selectedValue"
      :options="options"
      title="Enhanced Select"
    />

    <!-- Recent selections -->
    <div v-if="searchHistory.length" class="mt-2">
      <p class="text-sm text-gray-600">Recent:</p>
      <div class="flex gap-1 mt-1">
        <button
          v-for="item in searchHistory"
          :key="item"
          @click="selectedValue = item"
          class="px-2 py-1 text-xs bg-gray-100 rounded"
        >
          {{ item }}
        </button>
      </div>
    </div>
  </div>
</template>
```

### 3. Composite Components

Combine multiple components for complex functionality:

```vue
<script setup>
import { ViInput, ViSelect, ViCheckBox } from '@mnr73/viputy';

const formData = ref({
  email: '',
  country: null,
  notifications: false
});
</script>

<template>
  <div class="space-y-4 p-4 border rounded-lg">
    <h3 class="font-semibold">User Preferences</h3>

    <ViInput
      v-model="formData.email"
      type="email"
      title="Email Address"
      required
    />

    <ViSelect v-model="formData.country" :options="countries" title="Country" />

    <ViCheckBox v-model="formData.notifications">
      Enable email notifications
    </ViCheckBox>
  </div>
</template>
```

## Advanced Slot Usage

### Scoped Slots with Data

Many components provide useful data through scoped slots:

```vue
<ViSelect v-model="selected" :options="users">
  <template #label="{ selected }">
    <div v-if="selected" class="flex items-center gap-2">
      <img :src="selected.avatar" class="w-6 h-6 rounded-full" />
      <span>{{ selected.name }}</span>
    </div>
    <span v-else class="text-gray-400">Select a user</span>
  </template>
  
  <template #option="{ option }">
    <div class="flex items-center gap-3 p-2">
      <img :src="option.avatar" class="w-8 h-8 rounded-full" />
      <div>
        <div class="font-medium">{{ option.name }}</div>
        <div class="text-sm text-gray-500">{{ option.email }}</div>
      </div>
    </div>
  </template>
</ViSelect>
```

### Dynamic Slot Content

Create dynamic, context-aware content:

```vue
<ViInput v-model="password" type="password" title="Password">
  <template #after>
    <div class="flex items-center gap-2">
      <!-- Password strength indicator -->
      <div class="flex gap-1">
        <div 
          v-for="i in 4" 
          :key="i"
          class="w-1 h-4 rounded"
          :class="{
            'bg-red-400': passwordStrength >= i && passwordStrength < 2,
            'bg-yellow-400': passwordStrength >= i && passwordStrength < 3,
            'bg-green-400': passwordStrength >= i && passwordStrength >= 3,
            'bg-gray-200': passwordStrength < i
          }"
        />
      </div>
      
      <!-- Copy button -->
      <button 
        @click="copyPassword"
        class="p-1 hover:bg-gray-100 rounded"
        title="Copy password"
      >
        <CopyIcon class="w-4 h-4" />
      </button>
    </div>
  </template>
</ViInput>
```

## Best Practices

### 1. **Maintain Consistency**

When creating custom components, follow the same patterns as existing components:

- Use consistent prop naming
- Provide proper TypeScript definitions
- Emit standard events (`update:modelValue`, `change`, etc.)

### 2. **Leverage Composition**

Instead of modifying core components, create wrapper components that extend functionality:

```vue
<!-- Good: Wrapper component -->
<MyCustomInput v-model="value" :validation="rules" />

<!-- Less ideal: Heavily modified core component -->
<ViInput v-model="value" :custom-validation="rules" @custom-event="handler" />
```

### 3. **Use Slots Appropriately**

- Use `#before` and `#after` for icons and buttons
- Use `#main` for completely custom input areas
- Use `#popup` for dropdown customization

### 4. **Preserve Accessibility**

Ensure your custom components maintain accessibility features:

- Keep focus management
- Preserve ARIA attributes
- Maintain keyboard navigation

## Component Extension Examples

All Viputy components are built with this extensible architecture. Here are some components that demonstrate this pattern:

- **ViTag** extends ViPart with custom tag management
- **ViSelect** extends ViDropdown with option filtering
- **ViSimpleDate** extends ViDropdown with calendar functionality

This architecture ensures that you can build upon existing components while maintaining consistency, performance, and accessibility across your application.
