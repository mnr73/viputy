<script setup>
// import { ViCheckBox, ViCheckSlider, ViInput } from '../../dist/index.es.js';
// import ViInput from '@/components/ViInput.vue';
// import ViSimpleDate from '@/components/ViSimpleDate.vue';
// import ViCheckSlider from '@/components/ViCheckSlider.vue';
// import ViSelect from '@/components/ViSelect.vue';
// import {
//   ViCheckBox,
//   ViCheckSlider,
//   ViInput,
//   ViSelect,
//   ViPart,
//   ViDropdown
// } from '../../dist/index.es.js';
// import { ViSimpleDate } from '../../dist/datePicker.es.js';
import {
  ViCheckBox,
  ViCheckSlider,
  ViInput,
  ViSelect,
  ViDropdown
} from '@mnr73/viputy';
import { ViSimpleDate } from '@mnr73/viputy/datePicker';
import { ref } from 'vue';

const checkbox = ref([]);
const inputVal1 = ref();
const date1 = ref();
const select1 = ref('');
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
      <ViInput v-model="inputVal1">
        <template #after></template>
      </ViInput>
      <div>{{ inputVal1 }}</div>
      <ViSelect v-model="select1" :options="['ali', 'milad']">
        <template #label>
          <span class="text-slate-500">{{ select1 }}</span>
        </template>
        <template #option="{ option }">
          {{ option }}
        </template>
      </ViSelect>
      <ViSimpleDate v-model="date1"></ViSimpleDate>
      <ViDropdown></ViDropdown>
    </div>
  </div>
</template>

<style scoped></style>
