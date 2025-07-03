# Checkbox & Radio Examples

Interactive examples demonstrating ViCheckBox, ViCheckSlider, and ViRadio components.

<script setup>
import { ref } from 'vue'
import ViCheckBox from '../../src/components/ViCheckBox.vue'
import ViCheckSlider from '../../src/components/ViCheckSlider.vue'
import ViRadio from '../../src/components/ViRadio.vue'

// Simple boolean examples
const agreeTerms = ref(false)
const enableNotifications = ref(true)
const isDarkMode = ref(false)

// Array-based examples
const selectedHobbies = ref(['reading', 'gaming'])
const selectedSkills = ref([])
const selectedFeatures = ref(['feature1'])

// Radio examples
const selectedPlan = ref('basic')
const selectedTheme = ref('light')
const selectedSize = ref('medium')
const selectedPayment = ref(null)

// Disabled states
const disabledCheck = ref(true)
const disabledSlider = ref(false)
const disabledRadio = ref('option1')

// Form examples
const userPreferences = ref({
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  darkMode: false,
  autoSave: true
})

const surveyData = ref({
  satisfaction: null,
  recommend: null,
  frequency: null
})

// Data arrays
const hobbies = [
  { value: 'reading', label: '📚 Reading' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'cooking', label: '👨‍🍳 Cooking' },
  { value: 'traveling', label: '✈️ Traveling' },
  { value: 'photography', label: '📸 Photography' }
]

const skills = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' }
]

const plans = [
  { value: 'free', label: 'Free Plan', description: 'Basic features only', price: '$0' },
  { value: 'basic', label: 'Basic Plan', description: 'Standard features', price: '$9/month' },
  { value: 'pro', label: 'Pro Plan', description: 'Advanced features', price: '$29/month' },
  { value: 'enterprise', label: 'Enterprise', description: 'All features', price: '$99/month' }
]
</script>

## ViCheckBox Examples

### Simple Boolean Checkbox

Basic checkbox for boolean values.

::: raw

<div class="space-y-3">
  <ViCheckBox v-model="agreeTerms">
    I agree to the terms and conditions
  </ViCheckBox>
  
  <ViCheckBox v-model="enableNotifications">
    Enable email notifications
  </ViCheckBox>
  
  <div class="text-sm text-gray-600 mt-2">
    Terms: {{ agreeTerms ? 'Accepted' : 'Not accepted' }}<br>
    Notifications: {{ enableNotifications ? 'Enabled' : 'Disabled' }}
  </div>
</div>
:::

```vue
<script setup>
const agreeTerms = ref(false);
const enableNotifications = ref(true);
</script>

<template>
  <ViCheckBox v-model="agreeTerms">
    I agree to the terms and conditions
  </ViCheckBox>

  <ViCheckBox v-model="enableNotifications">
    Enable email notifications
  </ViCheckBox>
</template>
```

### Array-based Multiple Selection

Checkboxes with array values for multiple selections.

::: raw

<div class="space-y-4">
  <div>
    <h4 class="font-medium mb-2">Select your hobbies:</h4>
    <div class="space-y-2">
      <ViCheckBox 
        v-for="hobby in hobbies" 
        :key="hobby.value"
        v-model="selectedHobbies" 
        :value="hobby.value"
      >
        {{ hobby.label }}
      </ViCheckBox>
    </div>
    <div class="text-sm text-gray-600 mt-2">
      Selected: {{ selectedHobbies.join(', ') || 'None' }}
    </div>
  </div>
  
  <div>
    <h4 class="font-medium mb-2">Technical skills:</h4>
    <div class="grid grid-cols-2 gap-2">
      <ViCheckBox 
        v-for="skill in skills" 
        :key="skill.value"
        v-model="selectedSkills" 
        :value="skill.value"
      >
        {{ skill.label }}
      </ViCheckBox>
    </div>
    <div class="text-sm text-gray-600 mt-2">
      Skills: {{ selectedSkills.length }} selected
    </div>
  </div>
</div>
:::

```vue
<script setup>
const selectedHobbies = ref(['reading']);
const hobbies = [
  { value: 'reading', label: '📚 Reading' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'cooking', label: '👨‍🍳 Cooking' }
];
</script>

<template>
  <ViCheckBox
    v-for="hobby in hobbies"
    :key="hobby.value"
    v-model="selectedHobbies"
    :value="hobby.value"
  >
    {{ hobby.label }}
  </ViCheckBox>
</template>
```

### Disabled Checkbox

Checkbox in disabled state.

::: raw

<div class="space-y-2">
  <ViCheckBox v-model="disabledCheck" disabled>
    This checkbox is disabled (checked)
  </ViCheckBox>
  
  <ViCheckBox :modelValue="false" disabled>
    This checkbox is disabled (unchecked)
  </ViCheckBox>
</div>
:::

```vue
<ViCheckBox v-model="value" disabled>
  Disabled checkbox
</ViCheckBox>
```

## ViCheckSlider Examples

### Simple Toggle Switches

Modern toggle switches for boolean values.

::: raw

<div class="space-y-4">
  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <div class="font-medium">Dark Mode</div>
      <div class="text-sm text-gray-600">Switch to dark theme</div>
    </div>
    <ViCheckSlider v-model="isDarkMode" />
  </div>
  
  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <div class="font-medium">Auto Save</div>
      <div class="text-sm text-gray-600">Automatically save changes</div>
    </div>
    <ViCheckSlider v-model="userPreferences.autoSave" />
  </div>
  
  <div class="text-sm text-gray-600">
    Dark Mode: {{ isDarkMode ? 'On' : 'Off' }}<br>
    Auto Save: {{ userPreferences.autoSave ? 'Enabled' : 'Disabled' }}
  </div>
</div>
:::

```vue
<script setup>
const isDarkMode = ref(false);
const autoSave = ref(true);
</script>

<template>
  <div class="flex items-center justify-between">
    <span>Dark Mode</span>
    <ViCheckSlider v-model="isDarkMode" />
  </div>

  <div class="flex items-center justify-between">
    <span>Auto Save</span>
    <ViCheckSlider v-model="autoSave" />
  </div>
</template>
```

### Settings Panel with Multiple Toggles

Complete settings panel using toggle switches.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
  <h3 class="text-lg font-semibold mb-4">Notification Settings</h3>
  
  <div class="space-y-3">
    <div class="flex items-center justify-between py-2">
      <div>
        <div class="font-medium">📧 Email Notifications</div>
        <div class="text-sm text-gray-500">Receive updates via email</div>
      </div>
      <ViCheckSlider v-model="userPreferences.emailNotifications" />
    </div>
    
    <div class="flex items-center justify-between py-2">
      <div>
        <div class="font-medium">📱 SMS Notifications</div>
        <div class="text-sm text-gray-500">Receive text messages</div>
      </div>
      <ViCheckSlider v-model="userPreferences.smsNotifications" />
    </div>
    
    <div class="flex items-center justify-between py-2">
      <div>
        <div class="font-medium">🔔 Push Notifications</div>
        <div class="text-sm text-gray-500">Browser notifications</div>
      </div>
      <ViCheckSlider v-model="userPreferences.pushNotifications" />
    </div>
  </div>
  
  <div class="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
    Active: {{ Object.entries(userPreferences).filter(([key, value]) => value).map(([key]) => key).join(', ') }}
  </div>
</div>
:::

```vue
<script setup>
const settings = ref({
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true
});
</script>

<template>
  <div class="settings-panel">
    <div class="setting-item">
      <div>
        <div>Email Notifications</div>
        <div class="description">Receive updates via email</div>
      </div>
      <ViCheckSlider v-model="settings.emailNotifications" />
    </div>
  </div>
</template>
```

### Array-based Toggle Switches

Toggle switches with array values.

::: raw

<div class="space-y-3">
  <h4 class="font-medium">Enable Features:</h4>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span>🚀 Feature Alpha</span>
      <ViCheckSlider v-model="selectedFeatures" value="feature1" />
    </div>
    <div class="flex items-center justify-between">
      <span>🎯 Feature Beta</span>
      <ViCheckSlider v-model="selectedFeatures" value="feature2" />
    </div>
    <div class="flex items-center justify-between">
      <span>⭐ Feature Gamma</span>
      <ViCheckSlider v-model="selectedFeatures" value="feature3" />
    </div>
  </div>
  <div class="text-sm text-gray-600">
    Enabled features: {{ selectedFeatures.join(', ') || 'None' }}
  </div>
</div>
:::

```vue
<script setup>
const selectedFeatures = ref(['feature1']);
</script>

<template>
  <ViCheckSlider v-model="selectedFeatures" value="feature1">
    Feature Alpha
  </ViCheckSlider>
  <ViCheckSlider v-model="selectedFeatures" value="feature2">
    Feature Beta
  </ViCheckSlider>
</template>
```

### Disabled Toggle Switch

::: raw

<div class="space-y-2">
  <div class="flex items-center justify-between opacity-60">
    <span>Disabled toggle (on)</span>
    <ViCheckSlider :modelValue="true" disabled />
  </div>
  <div class="flex items-center justify-between opacity-60">
    <span>Disabled toggle (off)</span>
    <ViCheckSlider :modelValue="false" disabled />
  </div>
</div>
:::

```vue
<ViCheckSlider v-model="value" disabled />
```

## ViRadio Examples

### Basic Radio Group

Simple radio button group for single selection.

::: raw

<div class="space-y-4">
  <div>
    <h4 class="font-medium mb-3">Choose your subscription plan:</h4>
    <div class="space-y-2">
      <ViRadio v-model="selectedPlan" value="free" name="plan">
        🆓 Free Plan - $0/month
      </ViRadio>
      <ViRadio v-model="selectedPlan" value="basic" name="plan">
        ⭐ Basic Plan - $9/month
      </ViRadio>
      <ViRadio v-model="selectedPlan" value="pro" name="plan">
        🚀 Pro Plan - $29/month
      </ViRadio>
      <ViRadio v-model="selectedPlan" value="enterprise" name="plan">
        💼 Enterprise - $99/month
      </ViRadio>
    </div>
    <div class="text-sm text-gray-600 mt-3">
      Selected plan: {{ selectedPlan || 'None' }}
    </div>
  </div>
</div>
:::

```vue
<script setup>
const selectedPlan = ref('basic');
</script>

<template>
  <ViRadio v-model="selectedPlan" value="free" name="plan"> Free Plan </ViRadio>
  <ViRadio v-model="selectedPlan" value="basic" name="plan">
    Basic Plan
  </ViRadio>
  <ViRadio v-model="selectedPlan" value="pro" name="plan"> Pro Plan </ViRadio>
</template>
```

### Advanced Radio Cards

Radio buttons with detailed card layouts.

::: raw

<div class="space-y-4">
  <h4 class="font-medium mb-3">Select a plan:</h4>
  <div class="grid gap-3">
    <div 
      v-for="plan in plans" 
      :key="plan.value"
      class="border rounded-lg p-4 cursor-pointer transition-all"
      :class="{
        'border-blue-500 bg-blue-50': selectedPlan === plan.value,
        'border-gray-200 hover:border-gray-300': selectedPlan !== plan.value
      }"
      @click="selectedPlan = plan.value"
    >
      <div class="flex items-start gap-3">
        <ViRadio v-model="selectedPlan" :value="plan.value" name="planCards" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h5 class="font-semibold">{{ plan.label }}</h5>
            <span class="font-bold text-green-600">{{ plan.price }}</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ plan.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="text-sm text-gray-600">
    Selected: {{ plans.find(p => p.value === selectedPlan)?.label || 'None' }}
  </div>
</div>
:::

```vue
<div class="space-y-4">
  <h4 class="font-medium mb-3">Select a plan:</h4>
  <div class="grid gap-3">
    <div
      v-for="plan in plans"
      :key="plan.value"
      class="border rounded-lg p-4 cursor-pointer transition-all"
      :class="{
        'border-blue-500 bg-blue-50': selectedPlan === plan.value,
        'border-gray-200 hover:border-gray-300': selectedPlan !== plan.value
      }"
      @click="selectedPlan = plan.value"
    >
      <div class="flex items-start gap-3">
        <ViRadio v-model="selectedPlan" :value="plan.value" name="planCards" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h5 class="font-semibold">{{ plan.label }}</h5>
            <span class="font-bold text-green-600">{{ plan.price }}</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ plan.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="text-sm text-gray-600">
    Selected: {{ plans.find(p => p.value === selectedPlan)?.label || 'None' }}
  </div>
</div>
```

### Survey Form with Radio Groups

Multiple radio groups in a survey form.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
  <h3 class="text-lg font-semibold">Customer Feedback Survey</h3>
  
  <div>
    <h4 class="font-medium mb-2">How satisfied are you with our service?</h4>
    <div class="space-y-1">
      <ViRadio v-model="surveyData.satisfaction" value="very-satisfied" name="satisfaction">
        😄 Very Satisfied
      </ViRadio>
      <ViRadio v-model="surveyData.satisfaction" value="satisfied" name="satisfaction">
        🙂 Satisfied
      </ViRadio>
      <ViRadio v-model="surveyData.satisfaction" value="neutral" name="satisfaction">
        😐 Neutral
      </ViRadio>
      <ViRadio v-model="surveyData.satisfaction" value="dissatisfied" name="satisfaction">
        🙁 Dissatisfied
      </ViRadio>
    </div>
  </div>
  
  <div>
    <h4 class="font-medium mb-2">Would you recommend us to others?</h4>
    <div class="space-y-1">
      <ViRadio v-model="surveyData.recommend" value="definitely" name="recommend">
        👍 Definitely
      </ViRadio>
      <ViRadio v-model="surveyData.recommend" value="probably" name="recommend">
        🤔 Probably
      </ViRadio>
      <ViRadio v-model="surveyData.recommend" value="unlikely" name="recommend">
        👎 Unlikely
      </ViRadio>
    </div>
  </div>
  
  <div>
    <h4 class="font-medium mb-2">How often do you use our service?</h4>
    <div class="space-y-1">
      <ViRadio v-model="surveyData.frequency" value="daily" name="frequency">
        📅 Daily
      </ViRadio>
      <ViRadio v-model="surveyData.frequency" value="weekly" name="frequency">
        📊 Weekly
      </ViRadio>
      <ViRadio v-model="surveyData.frequency" value="monthly" name="frequency">
        📋 Monthly
      </ViRadio>
      <ViRadio v-model="surveyData.frequency" value="rarely" name="frequency">
        ⏰ Rarely
      </ViRadio>
    </div>
  </div>
  
  <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
    <strong>Survey Data:</strong><br>
    Satisfaction: {{ surveyData.satisfaction || 'Not selected' }}<br>
    Recommend: {{ surveyData.recommend || 'Not selected' }}<br>
    Frequency: {{ surveyData.frequency || 'Not selected' }}
  </div>
</div>
:::

```vue
<script setup>
const surveyData = ref({
  satisfaction: null,
  recommend: null,
  frequency: null
});
</script>

<template>
  <div class="survey-form">
    <div class="question">
      <h4>How satisfied are you?</h4>
      <ViRadio
        v-model="surveyData.satisfaction"
        value="satisfied"
        name="satisfaction"
      >
        Satisfied
      </ViRadio>
      <ViRadio
        v-model="surveyData.satisfaction"
        value="neutral"
        name="satisfaction"
      >
        Neutral
      </ViRadio>
    </div>
  </div>
</template>
```

### Disabled Radio Buttons

::: raw

<div class="space-y-2">
  <ViRadio :modelValue="'option1'" disabled value="option1" name="disabled">
    Disabled radio (selected)
  </ViRadio>
  <ViRadio :modelValue="'option1'" disabled value="option2" name="disabled">
    Disabled radio (not selected)
  </ViRadio>
</div>
:::

```vue
<ViRadio v-model="value" value="option" disabled name="disabled">
  Disabled radio button
</ViRadio>
```

## Mixed Form Example

### Complete User Preferences Form

Combining all three components in a realistic form.

::: raw

<div class="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl">
  <h3 class="text-xl font-semibold">User Preferences</h3>
  
  <!-- Radio selection -->
  <div>
    <h4 class="font-medium mb-3">Preferred contact method:</h4>
    <div class="space-y-2">
      <ViRadio v-model="selectedPayment" value="email" name="contact">
        📧 Email
      </ViRadio>
      <ViRadio v-model="selectedPayment" value="phone" name="contact">
        📞 Phone
      </ViRadio>
      <ViRadio v-model="selectedPayment" value="sms" name="contact">
        💬 SMS
      </ViRadio>
    </div>
  </div>
  
  <!-- Toggle switches -->
  <div>
    <h4 class="font-medium mb-3">Notification preferences:</h4>
    <div class="space-y-3">
      <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span>Marketing emails</span>
        <ViCheckSlider v-model="userPreferences.emailNotifications" />
      </div>
      <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span>Product updates</span>
        <ViCheckSlider v-model="userPreferences.pushNotifications" />
      </div>
    </div>
  </div>
  
  <!-- Checkboxes -->
  <div>
    <h4 class="font-medium mb-3">Additional options:</h4>
    <div class="space-y-2">
      <ViCheckBox v-model="agreeTerms">
        I agree to the Terms of Service
      </ViCheckBox>
      <ViCheckBox v-model="enableNotifications">
        Subscribe to newsletter
      </ViCheckBox>
    </div>
  </div>
  
  <!-- Summary -->
  <div class="bg-blue-50 p-4 rounded-lg">
    <h5 class="font-medium text-blue-800 mb-2">Summary:</h5>
    <div class="text-sm text-blue-700">
      Contact: {{ selectedPayment || 'Not selected' }}<br>
      Marketing emails: {{ userPreferences.emailNotifications ? 'Yes' : 'No' }}<br>
      Product updates: {{ userPreferences.pushNotifications ? 'Yes' : 'No' }}<br>
      Terms accepted: {{ agreeTerms ? 'Yes' : 'No' }}<br>
      Newsletter: {{ enableNotifications ? 'Yes' : 'No' }}
    </div>
  </div>
</div>
:::

```vue
<script setup>
const preferences = ref({
  contactMethod: 'email',
  notifications: true,
  marketing: false,
  agreeTerms: false
});
</script>

<template>
  <form class="preferences-form">
    <!-- Radio group -->
    <ViRadio v-model="preferences.contactMethod" value="email" name="contact">
      Email
    </ViRadio>

    <!-- Toggle switches -->
    <ViCheckSlider v-model="preferences.notifications">
      Enable notifications
    </ViCheckSlider>

    <!-- Checkboxes -->
    <ViCheckBox v-model="preferences.agreeTerms"> I agree to terms </ViCheckBox>
  </form>
</template>
```

## Tips

- **ViCheckBox**: Use for boolean values or array-based multiple selections with `value` prop
- **ViCheckSlider**: Perfect for settings panels and on/off toggles, more modern appearance
- **ViRadio**: Use for single selection from multiple options, always include `name` attribute
- **Array values**: For multiple selections, use arrays with `value` prop on each option
- **Disabled state**: All components support `disabled` prop
- **Event handling**: All components emit `on` and `off` events in addition to `update:modelValue`
- **Accessibility**: Components include proper ARIA attributes and keyboard navigation
- **Styling**: Components are fully styled but can be customized with CSS classes
