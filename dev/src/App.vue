<script setup>
// import { ViCheckBox, ViCheckSlider, ViInput } from '../../dist/index.es.js';
import ViInput from '@/components/ViInput.vue';
import ViTag from '@/components/ViTag.vue';
import ViText from '@/components/ViText.vue';
import ViSelect from '@/components/ViSelect.vue';
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
import { ViCheckBox, ViCheckSlider, ViDropdown } from '@mnr73/viputy';
import { ViSimpleDate } from '@mnr73/viputy/datePicker';
import { ref } from 'vue';

const checkbox = ref([]);
const inputVal1 = ref();
const date1 = ref();
const select1 = ref('');
const tag1 = ref([]);
const text1 = ref([]);

function test(value) {
  console.log('t', value);
}
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
      <ViSimpleDate v-model="date1" calender="both"></ViSimpleDate>
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

  <div class="space-y-4">
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h4 class="font-medium mb-3">🛍️ Product: "Wireless Headphones"</h4>

      <ViTag
        v-model="productTags"
        title="Product Tags"
        :showTags="false"
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
</template>

<style scoped></style>
