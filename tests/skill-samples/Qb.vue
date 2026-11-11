<script setup lang="ts">
import { ref } from "vue";
import {
  ViQueryBuilder,
  toQueryString,
  type QueryField,
  type QueryItem
} from "../../src";
const fields: QueryField[] = [
  {
    key: "user",
    label: "User",
    type: "entity",
    search: async (q) => [{ key: 42, label: q }]
  },
  {
    key: "age",
    label: "Age",
    type: "number",
    operators: ">,=,<,between",
    multiple: true,
    min: 0
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [{ key: 1, label: "Buy" }]
  },
  {
    key: "date",
    label: "Date",
    type: "date",
    variants: [{ key: "create", label: "Created" }]
  }
];
const filters = ref<QueryItem[]>([
  { key: "age", op: "<", value: 30 },
  { key: "type", op: "in", value: [1, 2] }
]);
const qs: string = toQueryString(filters.value);
</script>
<template>
  <ViQueryBuilder v-model="filters" :fields="fields" clearable :title="qs" />
</template>
