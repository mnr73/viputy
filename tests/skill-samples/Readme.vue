<script setup>
import { ref } from "vue";
import { ViInput, ViDate, ViSelect } from "../../src";

const price = ref(2450000); // a real number
const born = ref("2026-11-10"); // ISO in, ISO out; shown as 1405/08/19
const city = ref(null);
</script>

<template>
  <ViInput v-model="price" type="number" grouped label="Price" />
  <ViDate v-model="born" label="Date" />
  <ViSelect v-model="city" :options="['Tehran', 'Shiraz']" label="City" />
</template>
