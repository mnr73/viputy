# ViText Examples

Interactive examples demonstrating the ViText component for multi-line text input.

<script setup>
import { ref } from 'vue'
import ViText from '../../src/components/ViText.vue'

// Basic examples
const basicText = ref('This is a basic textarea with some initial content.')
const emptyText = ref('')
const longText = ref('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')

// Status examples
const errorText = ref('This field has an error')
const warningText = ref('This might need attention')
const successText = ref('This looks good!')

// State examples
const disabledText = ref('This textarea is disabled and cannot be edited.')
const readonlyText = ref('This is read-only content that cannot be modified.')

// Sizing examples
const smallText = ref('')
const mediumText = ref('')
const largeText = ref('')

// Real-world examples
const commentText = ref('')
const messageText = ref('')
const descriptionText = ref('')
const feedbackText = ref('')
const codeText = ref('function hello() {\n  console.log("Hello World!");\n}')
</script>

## Basic Usage

### Simple Text Area

Basic textarea with title and placeholder.

::: raw
<div class="space-y-4">
  <ViText 
    v-model="basicText" 
    title="Description"
    placeholder="Enter your description..."
  />
  <div class="text-sm text-gray-600">
    Characters: {{ basicText.length }}
  </div>
</div>
:::

```vue
<script setup>
const description = ref('')
</script>

<template>
  <ViText 
    v-model="description" 
    title="Description"
    placeholder="Enter your description..."
  />
</template>
```

### Empty Text Area

Starting with no content.

::: raw
<div class="space-y-4">
  <ViText 
    v-model="emptyText" 
    title="Comments"
    placeholder="Type your comments here..."
  />
  <div class="text-sm text-gray-600">
    Empty: {{ emptyText.length === 0 ? 'Yes' : 'No' }}
  </div>
</div>
:::

```vue
<script setup>
const comments = ref('')
</script>

<template>
  <ViText 
    v-model="comments" 
    title="Comments"
    placeholder="Type your comments here..."
  />
</template>
```

## Status Indicators

### Error Status

::: raw
<ViText 
  v-model="errorText" 
  title="Error Field" 
  status="error"
  placeholder="This field has an error"
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Error Field" 
  status="error"
/>
```

### Warning Status

::: raw
<ViText 
  v-model="warningText" 
  title="Warning Field" 
  status="warning"
  placeholder="This might need attention"
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Warning Field" 
  status="warning"
/>
```

### Success Status

::: raw
<ViText 
  v-model="successText" 
  title="Success Field" 
  status="true"
  placeholder="This looks good"
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Success Field" 
  status="true"
/>
```

## Text Area States

### Disabled Text Area

::: raw
<ViText 
  v-model="disabledText" 
  title="Disabled Field" 
  disabled
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Disabled Field" 
  disabled
/>
```

### Read-only Text Area

::: raw
<ViText 
  v-model="readonlyText" 
  title="Read-only Field" 
  readonly
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Read-only Field" 
  readonly
/>
```

## Sizing Options

### Small Text Area

::: raw
<ViText 
  v-model="smallText" 
  title="Small Text Area" 
  rows="3"
  placeholder="Compact textarea with 3 rows..."
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Small Text Area" 
  rows="3"
/>
```

### Medium Text Area

::: raw
<ViText 
  v-model="mediumText" 
  title="Medium Text Area" 
  rows="6"
  placeholder="Standard textarea with 6 rows..."
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Medium Text Area" 
  rows="6"
/>
```

### Large Text Area

::: raw
<ViText 
  v-model="largeText" 
  title="Large Text Area" 
  rows="10"
  placeholder="Large textarea with 10 rows for longer content..."
/>
:::

```vue
<ViText 
  v-model="value" 
  title="Large Text Area" 
  rows="10"
/>
```

## Real-world Examples

### Comment Form

::: raw
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <h4 class="font-medium mb-3">💬 Leave a Comment</h4>
  <ViText 
    v-model="commentText" 
    title="Your Comment"
    rows="4"
    placeholder="Share your thoughts..."
  />
  <div class="flex justify-between items-center mt-3 text-sm text-gray-600">
    <span>{{ commentText.length }}/500 characters</span>
    <button 
      class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      :disabled="!commentText.trim()"
      :class="{ 'opacity-50 cursor-not-allowed': !commentText.trim() }"
    >
      Post Comment
    </button>
  </div>
</div>
:::

```vue
<script setup>
const comment = ref('')
</script>

<template>
  <ViText 
    v-model="comment" 
    title="Your Comment"
    rows="4"
    placeholder="Share your thoughts..."
  />
</template>
```

### Contact Message

::: raw
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <h4 class="font-medium mb-3">📧 Contact Us</h4>
  <ViText 
    v-model="messageText" 
    title="Message"
    rows="6"
    placeholder="Tell us how we can help you..."
  />
  <div class="mt-3">
    <div class="text-sm text-gray-600 mb-2">
      Message length: {{ messageText.length }}
    </div>
    <div 
      v-if="messageText.length < 10 && messageText.length > 0" 
      class="text-orange-600 text-xs"
    >
      💡 Your message seems quite short. Consider adding more details.
    </div>
    <div 
      v-if="messageText.length >= 50" 
      class="text-green-600 text-xs"
    >
      ✅ Great! Your message provides good detail.
    </div>
  </div>
</div>
:::

```vue
<script setup>
const message = ref('')
</script>

<template>
  <ViText 
    v-model="message" 
    title="Message"
    rows="6"
    placeholder="Tell us how we can help..."
  />
</template>
```

### Product Description

::: raw
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <h4 class="font-medium mb-3">🛍️ Product Description</h4>
  <ViText 
    v-model="descriptionText" 
    title="Description"
    rows="5"
    placeholder="Describe your product features, benefits, and specifications..."
  />
  <div class="mt-3 grid grid-cols-3 gap-4 text-xs">
    <div class="text-center p-2 bg-gray-50 rounded">
      <div class="font-medium">Characters</div>
      <div class="text-lg">{{ descriptionText.length }}</div>
    </div>
    <div class="text-center p-2 bg-gray-50 rounded">
      <div class="font-medium">Words</div>
      <div class="text-lg">{{ descriptionText.trim().split(/\s+/).filter(w => w).length }}</div>
    </div>
    <div class="text-center p-2 bg-gray-50 rounded">
      <div class="font-medium">Lines</div>
      <div class="text-lg">{{ descriptionText.split('\n').length }}</div>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const description = ref('')

const wordCount = computed(() => {
  return description.value.trim().split(/\s+/).filter(w => w).length
})
</script>

<template>
  <ViText 
    v-model="description" 
    title="Product Description"
    rows="5"
    placeholder="Describe your product..."
  />
</template>
```

### Feedback Form

::: raw
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <h4 class="font-medium mb-3">📝 Customer Feedback</h4>
  <ViText 
    v-model="feedbackText" 
    title="Your Feedback"
    rows="7"
    placeholder="Please share your experience, suggestions, or concerns..."
  />
  <div class="mt-3 space-y-2">
    <div class="flex justify-between text-sm">
      <span class="text-gray-600">Feedback Quality:</span>
      <span 
        :class="{
          'text-red-500': feedbackText.length < 20,
          'text-yellow-500': feedbackText.length >= 20 && feedbackText.length < 100,
          'text-green-500': feedbackText.length >= 100
        }"
      >
        {{ 
          feedbackText.length < 20 ? 'Too Short' : 
          feedbackText.length < 100 ? 'Good' : 'Excellent'
        }}
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div 
        class="h-2 rounded-full transition-all duration-300"
        :class="{
          'bg-red-400': feedbackText.length < 20,
          'bg-yellow-400': feedbackText.length >= 20 && feedbackText.length < 100,
          'bg-green-400': feedbackText.length >= 100
        }"
        :style="{ width: Math.min((feedbackText.length / 200) * 100, 100) + '%' }"
      ></div>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const feedback = ref('')

const feedbackQuality = computed(() => {
  if (feedback.value.length < 20) return 'Too Short'
  if (feedback.value.length < 100) return 'Good'
  return 'Excellent'
})
</script>

<template>
  <ViText 
    v-model="feedback" 
    title="Your Feedback"
    rows="7"
    placeholder="Share your experience..."
  />
</template>
```

### Code Editor Style

::: raw
<div class="bg-white border border-gray-200 rounded-lg p-4">
  <h4 class="font-medium mb-3">💻 Code Snippet</h4>
  <ViText 
    v-model="codeText" 
    title="JavaScript Code"
    rows="8"
    placeholder="Enter your code here..."
    class="font-mono"
  />
  <div class="mt-3 flex justify-between items-center text-sm">
    <div class="text-gray-600">
      Lines: {{ codeText.split('\n').length }}
    </div>
    <button 
      @click="navigator.clipboard.writeText(codeText)"
      class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
    >
      📋 Copy Code
    </button>
  </div>
</div>
:::

```vue
<script setup>
const code = ref('function hello() {\n  console.log("Hello!");\n}')

function copyCode() {
  navigator.clipboard.writeText(code.value)
}
</script>

<template>
  <ViText 
    v-model="code" 
    title="Code"
    rows="8"
    class="font-mono"
  />
  <button @click="copyCode">Copy Code</button>
</template>
```

## Advanced Features

### Character Limit with Validation

::: raw
<div class="space-y-4">
  <ViText 
    v-model="longText" 
    title="Limited Text"
    rows="4"
    maxlength="200"
    placeholder="Maximum 200 characters allowed..."
  />
  <div class="flex justify-between items-center text-sm">
    <span 
      :class="{
        'text-gray-600': longText.length < 180,
        'text-orange-600': longText.length >= 180 && longText.length < 200,
        'text-red-600': longText.length >= 200
      }"
    >
      {{ longText.length }}/200 characters
    </span>
    <span 
      v-if="longText.length >= 200" 
      class="text-red-600 text-xs"
    >
      Character limit reached!
    </span>
  </div>
</div>
:::

```vue
<script setup>
const text = ref('')
const maxLength = 200

const isNearLimit = computed(() => text.value.length >= maxLength * 0.9)
const isAtLimit = computed(() => text.value.length >= maxLength)
</script>

<template>
  <ViText 
    v-model="text" 
    title="Limited Text"
    :maxlength="maxLength"
  />
  <div class="character-counter">
    {{ text.length }}/{{ maxLength }}
  </div>
</template>
```

### Built-in Character Counter

Using the built-in `showDetails` prop to display character count.

::: raw
<div class="space-y-4">
  <ViText 
    v-model="basicText" 
    title="Text with Details"
    rows="5"
    showDetails
    placeholder="Type something and see the character count..."
  />
  <div class="text-sm text-gray-600">
    The showDetails prop automatically shows character count below the textarea
  </div>
</div>
:::

```vue
<script setup>
const text = ref('')
</script>

<template>
  <ViText 
    v-model="text" 
    title="Text with Details"
    showDetails
    placeholder="Type something..."
  />
</template>
```

### Details with Character Limit

Combining `showDetails` with `maxlength` for automatic validation display.

::: raw
<div class="space-y-4">
  <ViText 
    v-model="emptyText" 
    title="Limited Text with Details"
    rows="4"
    maxlength="150"
    showDetails
    placeholder="Maximum 150 characters with built-in counter..."
  />
  <div class="text-sm text-gray-600">
    Built-in counter shows current/max characters automatically
  </div>
</div>
:::

```vue
<script setup>
const text = ref('')
</script>

<template>
  <ViText 
    v-model="text" 
    title="Limited Text with Details"
    maxlength="150"
    showDetails
    placeholder="Type up to 150 characters..."
  />
</template>
```

## Tips

- **Auto-resize**: ViText automatically adjusts height based on content
- **Rows**: Use `rows` prop to set initial height
- **Maxlength**: Combine with character counters for better UX
- **Status**: Use status props for validation feedback
- **Styling**: Add custom classes for specific use cases (like code editors)
- **Accessibility**: Component includes proper ARIA attributes and labels
- **Performance**: Debounce input for real-time validation on large texts
