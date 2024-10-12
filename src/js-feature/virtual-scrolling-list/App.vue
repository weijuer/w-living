<template>
  <section>
    <virtual-scrolling-list :items="items">
      <template #default="{ item }">
        <div class="id">#{{ item.id }} - {{ item.text }}</div>
      </template>
    </virtual-scrolling-list>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { getDataJson } from "./data.js";
import VirtualScrollingList from "./VirtualScrollingList.vue";

const items = computed(() => getDataJson(1000));
</script>
