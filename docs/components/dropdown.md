# ViDropdown Examples

Interactive examples demonstrating ViDropdown and ViPopup components - the building blocks for custom dropdown components.

<script setup>
import { ref, computed } from 'vue'
import ViDropdown from '../../src/components/ViDropdown.vue'
import ViPopup from '../../src/components/ViPopup.vue'

// Basic examples
const basicDropdown = ref('')
const basicPopup = ref('')

// Custom dropdown examples
const passengerCounts = ref({
  adults: 1,
  children: 0,
  infants: 0
})

const colorPicker = ref('#3b82f6')
const selectedColor = ref({
  name: 'Blue',
  hex: '#3b82f6'
})

// Popup examples
const showNotification = ref(false)
const showConfirmDialog = ref(false)
const showCustomForm = ref(false)

// Flight passenger example data
const colors = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Yellow', hex: '#f59e0b' }
]

// Computed values
const totalPassengers = computed(() => {
  return passengerCounts.value.adults + passengerCounts.value.children + passengerCounts.value.infants
})

const passengerSummary = computed(() => {
  const parts = []
  if (passengerCounts.value.adults > 0) {
    parts.push(`${passengerCounts.value.adults} Adult${passengerCounts.value.adults > 1 ? 's' : ''}`)
  }
  if (passengerCounts.value.children > 0) {
    parts.push(`${passengerCounts.value.children} Child${passengerCounts.value.children > 1 ? 'ren' : ''}`)
  }
  if (passengerCounts.value.infants > 0) {
    parts.push(`${passengerCounts.value.infants} Infant${passengerCounts.value.infants > 1 ? 's' : ''}`)
  }
  return parts.length > 0 ? parts.join(', ') : 'No passengers'
})

// Functions
function incrementPassenger(type) {
  if (type === 'adults' && passengerCounts.value.adults < 9) {
    passengerCounts.value.adults++
  } else if (type === 'children' && passengerCounts.value.children < 8) {
    passengerCounts.value.children++
  } else if (type === 'infants' && passengerCounts.value.infants < passengerCounts.value.adults) {
    passengerCounts.value.infants++
  }
}

function decrementPassenger(type) {
  if (type === 'adults' && passengerCounts.value.adults > 1) {
    passengerCounts.value.adults--
    // If infants exceed adults, reduce infants
    if (passengerCounts.value.infants > passengerCounts.value.adults) {
      passengerCounts.value.infants = passengerCounts.value.adults
    }
  } else if (type === 'children' && passengerCounts.value.children > 0) {
    passengerCounts.value.children--
  } else if (type === 'infants' && passengerCounts.value.infants > 0) {
    passengerCounts.value.infants--
  }
}

function selectColor(color) {
  selectedColor.value = color
  colorPicker.value = color.hex
}
</script>

## What are ViDropdown & ViPopup?

These are the **foundational components** used to build custom dropdown and popup interfaces in Viputy. They provide the base functionality that powers components like ViSelect, ViSelectPopup, and ViSimpleDate.

### Component Architecture

- **ViDropdown** - Creates dropdown interfaces with input field and collapsible content
- **ViPopup** - Creates overlay popups and modal-like interfaces
- **Building Blocks** - Both components provide slots and events for complete customization

### Built with These Components

- ✅ **ViSelect** - Uses ViDropdown as its foundation
- ✅ **ViSelectPopup** - Uses ViPopup for selection interfaces
- ✅ **ViSimpleDate** - Uses ViDropdown for date picker functionality
- ✅ **Custom Components** - Build your own dropdowns and popups

## ViDropdown Examples

### Basic Dropdown

Simple dropdown with custom content.

::: raw

<div class="space-y-4">
  <ViDropdown title="Basic Dropdown" v-model="basicDropdown">
    <template #label>
      <span v-if="basicDropdown">Selected: {{ basicDropdown }}</span>
      <span v-else class="text-gray-400">Choose an option</span>
    </template>
    <template #popup>
      <div class="p-4 space-y-2">
        <div 
          v-for="option in ['Option 1', 'Option 2', 'Option 3']" 
          :key="option"
          class="p-2 hover:bg-gray-100 rounded cursor-pointer"
          @click="basicDropdown = option"
        >
          {{ option }}
        </div>
      </div>
    </template>
  </ViDropdown>
  <div class="text-sm text-gray-600">
    Selected: {{ basicDropdown || 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const selected = ref('');
</script>

<template>
  <ViDropdown title="Basic Dropdown" v-model="selected">
    <template #label>
      <span v-if="selected">Selected: {{ selected }}</span>
      <span v-else>Choose an option</span>
    </template>
    <template #popup>
      <div class="p-4 space-y-2">
        <div
          v-for="option in options"
          :key="option"
          class="p-2 hover:bg-gray-100 rounded cursor-pointer"
          @click="selected = option"
        >
          {{ option }}
        </div>
      </div>
    </template>
  </ViDropdown>
</template>
```

### Flight Passenger Selector

Custom dropdown for selecting flight passengers with counters.

::: raw

<div class="space-y-4">
  <ViDropdown title="Passengers">
    <template #label>
      <div class="flex items-center justify-between w-full">
        <span>{{ passengerSummary }}</span>
        <span class="text-sm text-gray-500">{{ totalPassengers }} passenger{{ totalPassengers !== 1 ? 's' : '' }}</span>
      </div>
    </template>
    <template #popup>
      <div class="p-4 w-80 space-y-4">
        <h4 class="font-medium text-gray-800 mb-3">Select Passengers</h4>
        <!-- Adults -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Adults</div>
            <div class="text-sm text-gray-500">12+ years</div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="decrementPassenger('adults')"
              :disabled="passengerCounts.adults <= 1"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span class="w-8 text-center font-medium">{{ passengerCounts.adults }}</span>
            <button 
              @click="incrementPassenger('adults')"
              :disabled="passengerCounts.adults >= 9"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
        <!-- Children -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Children</div>
            <div class="text-sm text-gray-500">2-11 years</div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="decrementPassenger('children')"
              :disabled="passengerCounts.children <= 0"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span class="w-8 text-center font-medium">{{ passengerCounts.children }}</span>
            <button 
              @click="incrementPassenger('children')"
              :disabled="passengerCounts.children >= 8"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
        <!-- Infants -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">Infants</div>
            <div class="text-sm text-gray-500">Under 2 years</div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="decrementPassenger('infants')"
              :disabled="passengerCounts.infants <= 0"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span class="w-8 text-center font-medium">{{ passengerCounts.infants }}</span>
            <button 
              @click="incrementPassenger('infants')"
              :disabled="passengerCounts.infants >= passengerCounts.adults"
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
        <div class="pt-3 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <div>• Each infant must be accompanied by an adult</div>
            <div>• Maximum 9 passengers per booking</div>
          </div>
        </div>
      </div>
    </template>
  </ViDropdown>
  <div class="text-sm text-gray-600">
    Total: {{ totalPassengers }} passengers (Adults: {{ passengerCounts.adults }}, Children: {{ passengerCounts.children }}, Infants: {{ passengerCounts.infants }})
  </div>
</div>
:::

```vue
<script setup>
const passengerCounts = ref({
  adults: 1,
  children: 0,
  infants: 0
});

const passengerSummary = computed(() => {
  const parts = [];
  if (passengerCounts.value.adults > 0) {
    parts.push(
      `${passengerCounts.value.adults} Adult${passengerCounts.value.adults > 1 ? 's' : ''}`
    );
  }
  if (passengerCounts.value.children > 0) {
    parts.push(
      `${passengerCounts.value.children} Child${passengerCounts.value.children > 1 ? 'ren' : ''}`
    );
  }
  if (passengerCounts.value.infants > 0) {
    parts.push(
      `${passengerCounts.value.infants} Infant${passengerCounts.value.infants > 1 ? 's' : ''}`
    );
  }
  return parts.join(', ');
});

function incrementPassenger(type) {
  // Implementation for incrementing passenger count
}

function decrementPassenger(type) {
  // Implementation for decrementing passenger count
}
</script>

<template>
  <ViDropdown title="Passengers">
    <template #label>
      {{ passengerSummary }}
    </template>
    <template #popup>
      <div class="passenger-selector">
        <!-- Passenger counter interface -->
      </div>
    </template>
  </ViDropdown>
</template>
```

### Color Picker Dropdown

Custom color picker using ViDropdown.

::: raw

<div class="space-y-4">
  <ViDropdown title="Color">
    <template #label>
      <div class="flex items-center gap-2">
        <div 
          class="w-6 h-6 rounded border border-gray-300"
          :style="{ backgroundColor: selectedColor.hex }"
        ></div>
        <span>{{ selectedColor.name }}</span>
      </div>
    </template>
    <template #popup>
      <div class="p-4 w-64">
        <h4 class="font-medium mb-3">Choose Color</h4>
        <div class="grid grid-cols-3 gap-2">
          <div 
            v-for="color in colors" 
            :key="color.hex"
            class="aspect-square rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
            :class="{
              'border-gray-800': selectedColor.hex === color.hex,
              'border-gray-300': selectedColor.hex !== color.hex
            }"
            :style="{ backgroundColor: color.hex }"
            @click="selectColor(color)"
            :title="color.name"
          ></div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-200">
          <label class="block text-sm font-medium mb-1">Custom Color:</label>
          <input 
            type="color" 
            v-model="colorPicker"
            class="w-full h-10 rounded border border-gray-300 cursor-pointer"
            @change="selectedColor = { name: 'Custom', hex: colorPicker }"
          />
        </div>
      </div>
    </template>
  </ViDropdown>
  <div class="text-sm text-gray-600">
    Selected: {{ selectedColor.name }} ({{ selectedColor.hex }})
  </div>
</div>
:::

```vue
<script setup>
const selectedColor = ref({ name: 'Blue', hex: '#3b82f6' });
const colors = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' }
];

function selectColor(color) {
  selectedColor.value = color;
}
</script>

<template>
  <ViDropdown title="Color">
    <template #label>
      <div class="flex items-center gap-2">
        <div
          class="color-preview"
          :style="{ backgroundColor: selectedColor.hex }"
        ></div>
        <span>{{ selectedColor.name }}</span>
      </div>
    </template>
    <template #popup>
      <div class="color-picker">
        <!-- Color grid and picker interface -->
      </div>
    </template>
  </ViDropdown>
</template>
```

## Key Features

### ViDropdown

- 🎯 **Input Field** - Provides styled input with label display
- 📋 **Popup Content** - Completely customizable dropdown content
- ⌨️ **Keyboard Navigation** - Built-in keyboard support
- 🎨 **Status States** - Error, warning, success indicators
- 🔧 **Event Handling** - Open, close, and interaction events

## Tips

- **Composition**: Use these as building blocks for complex interactions
- **Slots**: Leverage slots for complete UI customization
- **Events**: Listen to open/close events for side effects
- **Accessibility**: Both components include proper ARIA attributes
- **Styling**: Customize appearance with CSS classes and slots
- **State Management**: Use v-model for reactive show/hide behavior
- **Complex UI**: Combine both components for advanced interfaces
