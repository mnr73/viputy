<script setup lang="ts">
import { ref } from "vue";
import { ViUpload, type UploadFile } from "../../src";

// the saved files come from your API; new ones are added by the user
const files = ref<UploadFile[]>([
  { id: 1, name: "contract.pdf", size: 482113, url: "/files/1" }
]);
const token = "t";
</script>

<template>
  <ViUpload
    v-model="files"
    label="Attachments"
    multiple
    reorderable
    accept=".pdf,image/*"
    max-size="10MB"
    :max-files="5"
    url="/api/uploads"
    :headers="() => ({ Authorization: `Bearer ${token}` })"
    :before-remove="async (f) => true"
    @reject="(r) => console.warn(r.map((x) => x.message))"
  />
</template>
