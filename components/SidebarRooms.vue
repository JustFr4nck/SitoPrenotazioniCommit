<template>
  <ul
    class="w-64 text-sm font-medium text-gray-900 bg-white border border-gray-200 "
  >
    <h2 class="text-lg font-bold p-4 border-b">Sale riunioni</h2>

    <li
      v-for="room in rooms"
      :class="[
        selectedRooms.includes(room.nome)
          ? 'bg-blue-100 font-semibold'
          : 'hover:bg-gray-100',
      ]"
    >
      <input
        type="checkbox"
        :key="room.nome"
        @click="$emit('checkbox', room.nome)"
        :value="room.nome"
        class="cursor-pointer h-4 w-4 py-6 px-31 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
        id="piano"
      />
      <div class="pt-4 pb-4 cursor-pointer">
        <label class="ps-2" :style="{ color: room.colore }">●</label>
        <label class="ps-1" for="piano">{{ room.nome }}</label>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const { selectedRooms, rooms } = withDefaults(
  defineProps<{
    selected?: string;
    selectedRooms?: string[];
    rooms: Array<{ nome: string; colore: string; class?: string }>;
  }>(),
  {
    selected: "",
    selectedRooms: [],
  }
);
defineEmits(["checkbox"]);

const v = ref("");

function animationCreate(){

  v.value = 'tham-active'
}


</script>

<style scoped>
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: absolute;
  opacity: 0;
  width: 10%;
}
</style>
