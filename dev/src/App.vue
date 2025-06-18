<script setup>
import { ViCheckBox, ViCheckSlider, ViInput } from '../../dist/index.es.js';
// import ViInput from '@/components/ViInput.vue';
import ViSimpleDate from '@/components/ViSimpleDate.vue';
// import ViCheckSlider from '@/components/ViCheckSlider.vue';
import { ref } from 'vue';

const checkbox = ref([]);
const inputVal1 = ref();
const date1 = ref();
</script>

<template>
  <div class="bg-white mx-auto p-5 w-[800px]">
    <div class="p-2 grid gap-5">
      <div>
        <ViCheckBox v-model="checkbox" value="ali">click on me</ViCheckBox>
        <ViCheckSlider v-model="checkbox" value="ali"
          >click on me</ViCheckSlider
        >
      </div>
      <ViInput v-model="inputVal1"> </ViInput>
      <div>{{ inputVal1 }}</div>
      <ViSimpleDate v-model="date1"></ViSimpleDate>
    </div>
  </div>
</template>

<style scoped></style>
