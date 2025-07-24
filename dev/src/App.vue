<script setup>
// import { ViCheckBox, ViCheckSlider, ViInput } from '../../dist/index.es.js';
import ViInput from '@/components/ViInput.vue';
import ViTag from '@/components/ViTag.vue';
import ViText from '@/components/ViText.vue';
import ViSelect from '@/components/ViSelect.vue';
import ViSimpleDate from '@/components/ViSimpleDate.vue';
import ViDate from '@/components/ViDate.vue';
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
import { ViCheckBox, ViCheckSlider, ViDropdown } from '@mnr73/viputy';
// import { ViSimpleDate } from '@mnr73/viputy/datePicker';
import { ref } from 'vue';
import { DateTime } from 'luxon';

const checkbox = ref([]);
const inputVal1 = ref();
const date1 = ref();
const select1 = ref('');
const tag1 = ref([]);
const text1 = ref();

function test(value) {
  console.log('t', value);
}
</script>

<template>
  <div class="bg-white mx-auto p-5 w-[800px]">
    <div class="p-2 grid gap-5">
      <ViDate
        v-model="date1"
        :min="DateTime.now().minus({ years: 1 })"
        :max="DateTime.now().plus({ years: 1 })"
        calender="both"
        activeCalender="persian"
        :signedDate="DateTime.now()"
      ></ViDate>
      <div>
        <ViCheckBox v-model="checkbox" value="ali">click on me</ViCheckBox>
        <ViCheckSlider v-model="checkbox" value="ali"
          >click on me</ViCheckSlider
        >
      </div>
      <ViInput @input="test" v-model="inputVal1">
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
      <ViSimpleDate
        v-model="date1"
        :min="DateTime.now().minus({ years: 1 })"
        :max="DateTime.now().plus({ years: 1 })"
        calender="both"
      ></ViSimpleDate>
      <ViDropdown></ViDropdown>
      <ViInput type="password"></ViInput>
      <ViTag v-model="tag1"></ViTag>
      <ViText
        title="test"
        :showDetails="true"
        v-model="text1"
        :maxlength="10"
        placeholder="type here"
      >
        <template #before>a</template>
      </ViText>
      <ViText v-model="text1"></ViText>
    </div>
  </div>
</template>

<style scoped></style>
