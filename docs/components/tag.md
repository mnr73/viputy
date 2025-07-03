# ViTag Examples

Interactive examples demonstrating the ViTag component for managing multiple tags/keywords.

<script setup>
import { ref } from 'vue'
import ViTag from '../../src/components/ViTag.vue'

// Basic examples
const basicTags = ref(['Vue', 'JavaScript'])
const emptyTags = ref([])
const skillTags = ref(['TypeScript', 'Node.js'])

// Datalist examples
const techTags = ref(['React'])
const languageTags = ref([])
const frameworkTags = ref(['Vue.js', 'Express'])

// Custom display examples
const customTags = ref(['frontend', 'backend'])
const hiddenTags = ref(['design', 'ux'])

// Disabled state
const disabledTags = ref(['Read-only', 'Disabled'])

// Real-world examples
const projectTags = ref(['urgent', 'frontend'])
const blogTags = ref(['tutorial', 'vue'])
const productTags = ref(['electronics', 'mobile'])

// Data arrays for datalist
const technologies = [
  'JavaScript', 'TypeScript', 'Vue.js', 'React', 'Angular', 'Node.js', 
  'Python', 'PHP', 'Laravel', 'Express', 'MongoDB', 'MySQL'
]

const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
  'Arabic', 'Russian', 'Portuguese', 'Italian'
]

const projectCategories = [
  'urgent', 'low-priority', 'feature', 'bug', 'enhancement', 'documentation',
  'frontend', 'backend', 'mobile', 'desktop', 'testing', 'deployment'
]

const blogCategories = [
  'tutorial', 'news', 'review', 'guide', 'tips', 'vue', 'javascript', 
  'css', 'html', 'programming', 'web-development', 'career'
]
</script>

## What is ViTag?

ViTag is a powerful component for managing **multiple tags, keywords, or labels**. Unlike multi-select dropdowns that require choosing from predefined options, ViTag allows users to:

- **Create custom tags** by typing and pressing Enter
- **Remove tags** with a simple click
- **Get suggestions** from a datalist while allowing free input
- **Manage dynamic lists** of keywords, categories, or labels

### ViTag vs Multi-Select

| Feature             | ViTag                            | Multi-Select                     |
| ------------------- | -------------------------------- | -------------------------------- |
| **Input Method**    | Type and press Enter             | Choose from dropdown             |
| **Custom Values**   | ✅ Can create new tags           | ❌ Limited to predefined options |
| **Visual Display**  | Shows tags as removable chips    | Shows selected items in dropdown |
| **Use Case**        | Keywords, labels, free-form tags | Structured choices from a list   |
| **User Experience** | Creative, flexible input         | Guided selection                 |

## Basic Usage

### Simple Tag Input

Basic tag management with default display.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="basicTags" 
    title="Technologies"
    placeholder="Add technology..."
  />
  <div class="text-sm text-gray-600">
    Current tags: {{ basicTags.join(', ') || 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const tags = ref(['Vue', 'JavaScript']);
</script>

<template>
  <ViTag v-model="tags" title="Technologies" placeholder="Add technology..." />
</template>
```

### Empty Tag Input

Starting with no tags.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="emptyTags" 
    title="Skills"
    placeholder="Type a skill and press Enter..."
  />
  <div class="text-sm text-gray-600">
    Skills added: {{ emptyTags.length }}
  </div>
</div>
:::

```vue
<script setup>
const skills = ref([]);
</script>

<template>
  <ViTag
    v-model="skills"
    title="Skills"
    placeholder="Type a skill and press Enter..."
  />
</template>
```

## Datalist Integration

### With Predefined Suggestions

Using datalist to provide suggestions while allowing custom input.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="techTags" 
    title="Tech Stack"
    :datalist="technologies"
    placeholder="Choose or add technology..."
  />
  <div class="text-sm text-gray-600">
    Selected: {{ techTags.join(', ') || 'None' }}
  </div>
  <div class="text-xs text-gray-500">
    💡 Try typing "Vue", "React", or create your own custom tag
  </div>
</div>
:::

```vue
<script setup>
const techStack = ref(['React']);
const technologies = [
  'JavaScript',
  'TypeScript',
  'Vue.js',
  'React',
  'Angular',
  'Node.js',
  'Python',
  'PHP'
];
</script>

<template>
  <ViTag
    v-model="techStack"
    title="Tech Stack"
    :datalist="technologies"
    placeholder="Choose or add technology..."
  />
</template>
```

### Language Selection

Languages with extensive datalist.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="languageTags" 
    title="Languages"
    :datalist="languages"
    placeholder="Add languages you speak..."
  />
  <div class="text-sm text-gray-600">
    Languages: {{ languageTags.length ? languageTags.join(', ') : 'None selected' }}
  </div>
</div>
:::

```vue
<script setup>
const spokenLanguages = ref([]);
const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Arabic',
  'Russian'
];
</script>

<template>
  <ViTag
    v-model="spokenLanguages"
    title="Languages"
    :datalist="languages"
    placeholder="Add languages..."
  />
</template>
```

## Custom Tag Display

### Hidden Default Tags (Custom Display)

Disable the default tag display and create your own custom visualization.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="customTags" 
    title="Categories"
    hideTags
    placeholder="Add category..."
  />
  
  <!-- Custom tag display -->
  <div class="flex flex-wrap gap-2 mt-3">
    <span 
      v-for="tag in customTags" 
      :key="tag"
      class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full"
    >
      🏷️ {{ tag }}
      <button 
        @click="customTags = customTags.filter(t => t !== tag)"
        class="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
      >
        ❌
      </button>
    </span>
  </div>
  
  <div class="text-sm text-gray-600">
    Custom styled tags: {{ customTags.join(', ') || 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const categories = ref(['frontend', 'backend']);

function removeTag(tagToRemove) {
  categories.value = categories.value.filter((tag) => tag !== tagToRemove);
}
</script>

<template>
  <!-- Hidden default display -->
  <ViTag
    v-model="categories"
    title="Categories"
    hideTags
    placeholder="Add category..."
  />

  <!-- Custom tag display -->
  <div class="custom-tags">
    <span v-for="tag in categories" :key="tag" class="custom-tag">
      🏷️ {{ tag }}
      <button @click="removeTag(tag)">×</button>
    </span>
  </div>
</template>
```

### Completely Hidden Tags

Using ViTag as a pure input without any visual tags.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="hiddenTags" 
    title="Keywords"
    hideTags
    placeholder="Add keywords (hidden mode)..."
  />
  
  <div class="bg-gray-50 p-3 rounded">
    <h5 class="font-medium text-sm mb-2">Keywords List:</h5>
    <ul class="text-sm space-y-1">
      <li v-for="(tag, index) in hiddenTags" :key="tag" class="flex items-center gap-2">
        <span class="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs">
          {{ index + 1 }}
        </span>
        {{ tag }}
        <button 
          @click="hiddenTags = hiddenTags.filter(t => t !== tag)"
          class="text-red-500 hover:text-red-700 text-xs"
        >
          Remove
        </button>
      </li>
      <li v-if="!hiddenTags.length" class="text-gray-500 italic">
        No keywords added yet
      </li>
    </ul>
  </div>
</div>
:::

```vue
<script setup>
const keywords = ref(['design', 'ux']);
</script>

<template>
  <!-- Input only, no visual tags -->
  <ViTag
    v-model="keywords"
    title="Keywords"
    hideTags
    placeholder="Add keywords..."
  />

  <!-- Custom display elsewhere -->
  <div class="keywords-list">
    <div v-for="keyword in keywords" :key="keyword">
      {{ keyword }}
    </div>
  </div>
</template>
```

## Disabled State

### Read-only Tags

Tags in disabled state.

::: raw
<ViTag 
  v-model="disabledTags" 
  title="Read-only Tags"
  disabled
  placeholder="Cannot add new tags"
/>
:::

```vue
<ViTag v-model="tags" title="Read-only Tags" disabled />
```

## Real-world Examples

### Project Management Tags

Tags for project categorization.

::: raw

<div class="space-y-4">
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="font-medium mb-3">📋 Project: "New Website Redesign"</h4>
    <ViTag 
      v-model="projectTags" 
      title="Project Tags"
      :datalist="projectCategories"
      placeholder="Add project tags..."
    />
    <div class="mt-3 text-sm">
      <span class="text-gray-600">Status:</span>
      <span 
        v-if="projectTags.includes('urgent')" 
        class="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
      >
        🚨 Urgent
      </span>
      <span 
        v-if="projectTags.includes('frontend')" 
        class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
      >
        🎨 Frontend Work
      </span>
      <span 
        v-if="projectTags.includes('backend')" 
        class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
      >
        ⚙️ Backend Work
      </span>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const projectTags = ref(['urgent', 'frontend']);
const projectCategories = [
  'urgent',
  'low-priority',
  'feature',
  'bug',
  'frontend',
  'backend',
  'mobile',
  'testing'
];
</script>

<template>
  <ViTag
    v-model="projectTags"
    title="Project Tags"
    :datalist="projectCategories"
    placeholder="Add project tags..."
  />
</template>
```

### Blog Post Tags

Tags for blog content categorization.

::: raw

<div class="space-y-4">
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="font-medium mb-3">✍️ Blog Post: "Getting Started with Vue 3"</h4>
    <ViTag 
      v-model="blogTags" 
      title="Article Tags"
      :datalist="blogCategories"
      placeholder="Add relevant tags..."
    />
    <div class="mt-3 p-3 bg-gray-50 rounded">
      <h5 class="text-sm font-medium text-gray-700 mb-2">SEO Preview:</h5>
      <div class="text-xs text-gray-600">
        Tags: {{ blogTags.join(', ') }}<br>
        Categories: {{ blogTags.filter(tag => ['tutorial', 'guide', 'news'].includes(tag)).join(', ') || 'Uncategorized' }}
      </div>
    </div>
  </div>
</div>
:::

```vue
<script setup>
const blogTags = ref(['tutorial', 'vue']);
const blogCategories = [
  'tutorial',
  'news',
  'review',
  'guide',
  'tips',
  'vue',
  'javascript',
  'css',
  'programming'
];
</script>

<template>
  <ViTag
    v-model="blogTags"
    title="Article Tags"
    :datalist="blogCategories"
    placeholder="Add relevant tags..."
  />
</template>
```

### Product Tags with Custom Styling

E-commerce product tags with custom display.

::: raw

<div class="space-y-4">
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="font-medium mb-3">🛍️ Product: "Wireless Headphones"</h4>
    <ViTag 
      v-model="productTags"
      title="Product Tags"
      hideTags
      placeholder="Add product features..."
    />
    <!-- Custom product tag display -->
    <div class="mt-3">
      <h5 class="text-sm font-medium mb-2">Product Features:</h5>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in productTags"
          :key="tag"
          class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded border"
        >
          ⭐ {{ tag }}
          <button
            @click="productTags = productTags.filter((t) => t !== tag)"
            class="hover:bg-yellow-200 rounded px-1"
          >
            ×
          </button>
        </span>
        <span v-if="!productTags.length" class="text-gray-400 text-xs italic">
          No features tagged yet
        </span>
      </div>
    </div>
    <div class="mt-3 text-xs text-gray-500">
      💡 Add features like "wireless", "noise-cancelling", "bluetooth", etc.
    </div>
  </div>
</div>
:::

```vue
<script setup>
const productTags = ref(['electronics', 'mobile']);

function removeProductTag(tag) {
  productTags.value = productTags.value.filter((t) => t !== tag);
}
</script>

<template>
  <!-- Hidden default display -->
  <ViTag
    v-model="productTags"
    title="Product Tags"
    hideTags
    placeholder="Add product features..."
  />

  <!-- Custom e-commerce style tags -->
  <div class="product-features">
    <span v-for="tag in productTags" :key="tag" class="feature-tag">
      ⭐ {{ tag }}
      <button @click="removeProductTag(tag)">×</button>
    </span>
  </div>
</template>
```

## Advanced Features

### Tag Input with Validation

Custom validation and formatting.

::: raw

<div class="space-y-4">
  <ViTag 
    v-model="skillTags" 
    title="Professional Skills"
    :datalist="technologies"
    placeholder="Add technical skills..."
  />
  
  <div class="text-sm space-y-1">
    <div class="text-gray-600">
      Skills count: {{ skillTags.length }}/10
    </div>
    <div 
      v-if="skillTags.length >= 10" 
      class="text-red-600 text-xs"
    >
      ⚠️ Maximum 10 skills allowed
    </div>
    <div 
      v-if="skillTags.some(skill => skill.length > 15)" 
      class="text-yellow-600 text-xs"
    >
      💡 Some skills are quite long - consider abbreviating
    </div>
  </div>
</div>
:::

```vue
<script setup>
const skills = ref(['TypeScript', 'Node.js']);

// You can add validation logic
watch(skills, (newSkills) => {
  if (newSkills.length > 10) {
    skills.value = newSkills.slice(0, 10);
  }
});
</script>

<template>
  <ViTag v-model="skills" title="Skills" placeholder="Add skills..." />
</template>
```

## Key Features

### Default Behavior

- ✅ **Automatic tag display** - Shows tags as removable chips by default
- ✅ **Type and Enter** - Add tags by typing and pressing Enter
- ✅ **Click to remove** - Remove tags by clicking the × button
- ✅ **Datalist support** - Provide suggestions while allowing custom input

### Customization Options

- 🎨 **Custom display** - Use `hideTags` prop to hide default tags and create your own
- 🎯 **Flexible input** - Can create any custom tag, not limited to predefined options
- 🔧 **Event handling** - Listen to changes and implement custom validation
- 💫 **Styling freedom** - Complete control over tag appearance and behavior

## Tips

- **Default vs Custom**: Use default display for quick implementation, custom display for branded experiences
- **Datalist**: Provide common options while allowing creative input
- **Validation**: Implement custom validation logic using Vue's `watch` or `computed`
- **UX**: Consider maximum tag limits and provide clear feedback
- **Accessibility**: The component includes keyboard navigation and screen reader support
- **Performance**: For large datasets, consider debouncing input or limiting suggestions
