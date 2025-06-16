<script setup>
import ViCheckBox from '@/components/ViCheckBox.vue'
import ViInput from '@/components/ViInput.vue'
import { ref } from 'vue'

const checkbox = ref(false)
</script>

<template>
  <div class="bg-white mx-auto p-5 w-[800px]">
    <div class="p-2 grid gap-5">
      <ViCheckBox v-model="checkbox"></ViCheckBox>
      <ViInput></ViInput>
    </div>
  </div>
</template>

<style scoped></style>
