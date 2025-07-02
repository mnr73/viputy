# Installation

This guide will walk you through installing and configuring Viputy in your Vue 3 project.

## Prerequisites

Before installing Viputy, make sure you have the following dependencies in your project:

- **Vue 3.0+** - The component library is built for Vue 3
- **Tailwind CSS 4.0+** - Required for styling
- **Node.js 16+** - For package management

## Installation

### Install with npm

```bash
npm install @mnr73/viputy
```

## Version-specific Installation

If you need to install a specific version, you can specify it:

```bash
# Install specific version
npm install @mnr73/viputy@0.2.29-beta

```

## Configuration

### 1. Import CSS Styles

First, you need to import the CSS file in your main application file (usually `main.js` or `main.ts`):

```javascript
// main.js or main.ts
import { createApp } from 'vue';
import App from './App.vue';

// Import Viputy CSS
import '/node_modules/@mnr73/viputy/dist/viputy.css';

const app = createApp(App);
app.mount('#app');
```

### 2. Configure Tailwind CSS

Add the Viputy source path to your Tailwind CSS configuration to ensure proper styling. In your main CSS file where you configure Tailwind:

```css
/* styles.css or main.css */
@import 'tailwindcss';

/* Add Viputy source */
@source '../node_modules/@mnr73/viputy';
```

## Basic Usage

### Import Components

You can import components individually:

```vue
<script setup>
import { ViInput } from '@mnr73/viputy';
</script>

<template>
  <ViInput
    v-model="inputValue"
    title="Your Name"
    placeholder="Enter your name"
  />
</template>
```

### Import Date Picker Components

For date-related components, you need to install Luxon as a dependency and use the separate import:

```bash
# Install Luxon for date handling
npm install luxon
```

**Important:** The `v-model` for date picker components must be either `null` or a Luxon `DateTime` object.

```vue
<script setup>
import { ref } from 'vue';
import { ViSimpleDate } from '@mnr73/viputy/datePicker';
import { DateTime } from 'luxon';

// v-model can be null or DateTime object
const dateValue = ref(null); // or DateTime.now()

// Example with initial date value
const birthdateValue = ref(DateTime.fromISO('1990-01-15'));
</script>

<template>
  <ViSimpleDate
    v-model="dateValue"
    title="Select Date"
    placeholder="Choose a date"
  />

  <ViSimpleDate
    v-model="birthdateValue"
    title="Birth Date"
    :min="DateTime.now().minus({ years: 100 })"
    :max="DateTime.now()"
  />
</template>
```

## Troubleshooting

### Common Issues

1. **Styles not appearing**: Make sure you've imported the CSS file and configured Tailwind properly
2. **Components not found**: Verify the import paths are correct
3. **TypeScript errors**: The package includes TypeScript definitions, ensure your tsconfig.json is properly configured

### CSS Path Issues

If you're having trouble with the CSS import path, you can also try:

```javascript
// Alternative import methods
import '@mnr73/viputy/dist/viputy.css';
// or
import '../node_modules/@mnr73/viputy/dist/viputy.css';
```

## Next Steps

Now that you have Viputy installed and configured, you can:

- Explore the [Component Gallery](/components/) to see all available components

Need help? Check our [GitHub repository](https://github.com/mnr73/viputy) for issues and discussions.
