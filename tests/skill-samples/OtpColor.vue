<script setup lang="ts">
import { ref } from "vue";
import { ViColor, ViForm, ViOtp } from "../../src";

const color = ref<string | null>("#2563eb");
const code = ref("");
function verify(values: Record<string, unknown>) {
  // values.code is the string the user typed
  return values;
}
</script>

<template>
  <ViColor v-model="color" label="Brand colour" alpha clearable />
  <ViForm @submit="verify">
    <ViOtp
      v-model="code"
      name="code"
      label="Verification code"
      :length="6"
      auto-submit
      :rules="['required', { length: 6 }]"
    />
  </ViForm>
</template>
