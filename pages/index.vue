<template>
  <div class="w-full">
    <div class="flex transition-all duration-300" :class="{ 'pl-64': isOpen }">
      <transition name="slide-left">
        <div
          v-if="isOpen"
          class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg"
        >
          <SidebarRooms
            :selected="selectedRoom"
            :selected-rooms="selectedRooms"
            :rooms="rooms"
            @checkbox="
              ($event) => {
                selectedRoom = $event;
                setRoom();
              }
            "
          />
        </div>
      </transition>

      <div class="flex-1 min-h-screen bg-gray-100">
        <nav class="flex flex-row justyfy-items-start">
          <div class="justify-between items-center">
            <button
              @click="isOpen = !isOpen"
              class="text-gray-700 focus:outline-none mt-10 ml-8 bg-blue-400 rounded cursor-pointer"
            >
            <FontAwesomeIcon class="w-10 h-10" v-if="!isOpen" :icon="faBars" />
            <FontAwesomeIcon v-else :icon="faXmark" class="h-10 w-10" stroke="currentColor" />
            </button>
          </div>
          <div class="justify-between mt-9 ml-8">
            <h2 class="text-2xl font-bold">Prenotazioni</h2>
          </div>
        </nav>

        <!-- Contenuto pagina -->
        <main>
          <div class="p-8">
            <div v-if="loading" class="flex justify-center items-center h-96">
              <div
                class="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin"
              ></div>
            </div>
            <!--
        time-from="480" // 08:00 (8*60)
        time-to="1140" // 19:00 (19*60)
      -->
            <div v-else class="bg-white rounded shadow p-4">
              <div v-html="notificaRiunioni"></div>
              <div v-if="showAlert">
                <div
                  class="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50"
                  role="alert"
                >
                  <svg
                    class="shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                    />
                  </svg>
                  <span class="sr-only">Warn</span>
                  <div>
                    <span class="font-medium">ATTENZIONE!!!</span> Ci sono
                    prenotazioni in stanze non selezionate 🤔.
                  </div>
                </div>
              </div>
              <VueCal
                style="height: 600px"
                locale="it"
                :stack-events="true"
                default-view="week"
                :time="true"
                :views="['week', 'day']"
                :time-step="30"
                :time-cell-height="25"
                :time-from="480"
                :time-to="1140"
                :events="eventsForCalendar"
                :min-event-split="80"
                :editable-events="{
                  title: false,
                  drag: true,
                  delete: true,
                  create: false,
                  resize: false,
                }"
                time-zone="Europe/Rome"
                @cell-dblclick="onCellClick"
                @event-drop="onEventDrop"
                @event-click="onEventClick"
                @view-change="onViewChange"
              />
            </div>
            <div
              v-if="showModal"
              class="fixed inset-0 flex items-center justify-center bg-white/80 z-50"
            >
              <div class="bg-white p-6 rounded shadow w-full max-w-md">
                <h3 class="text-lg font-bold mb-4">Nuova prenotazione</h3>
                <form @submit.prevent="addEvent">
                  <div class="mb-4">
                    <div class="mb-4">
                      <label class="block mb-1">Sala</label>
                      <select
                        v-model="form.piano"
                        required
                        class="border rounded w-full p-2"
                      >
                        <option disabled value="">Scegli piano</option>
                        <option
                          v-for="room in MeetingRoomList"
                          :key="room"
                          :value="room"
                        >
                          {{ room }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="block mb-1">Titolo</label>
                    <input
                      v-model="form.title"
                      class="border rounded w-full p-2"
                      required
                    />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      class="border rounded w-full p-2"
                      required
                    />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Data</label>
                    <input
                      :value="selectedDate"
                      type="date"
                      class="border rounded w-full p-2 bg-gray-100 cursor-not-allowed"
                      readonly
                      disabled
                    />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Inizio</label>
                    <input
                      v-model="form.startTime"
                      type="time"
                      class="border rounded w-full p-2"
                      required
                    />
                  </div>
                  <div class="mb-4">
                    <label class="block mb-1">Fine</label>
                    <input
                      v-model="form.endTime"
                      type="time"
                      class="border rounded w-full p-2"
                      required
                    />
                  </div>
                  <div class="flex justify-enddate gap-2">
                    <button
                      type="button"
                      @click="showModal = false"
                      class="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-100"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-300 active:bg-blue-100"
                      @click="spinnerActive(form.piano, form.title, form.startTime, form.endTime, form.email)"
                      >
                      Salva
                    </button>
                    <div v-if="showSpinner" class="ml-50 my-2 h-6 w-6 rounded-full border-3 animate-spin border-blue-500 border-t-transparent"></div>
                  </div>
                </form>
              </div>
            </div>
            <div
              v-if="toastMessage"
              :class="[
                'fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white',
                toastType === 'success' ? 'bg-green-600' : 'bg-red-600',
              ]"
            >
              {{ toastMessage }}
            </div>
            <div
              v-if="showTokenModal"
              class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            >
              <div class="bg-white p-6 rounded shadow w-full max-w-sm">
                <h3 class="text-lg font-bold mb-4">Conferma token</h3>
                <p class="mb-2">
                  Per spostare questa prenotazione, inserisci il codice di
                  sicurezza (lo puoi trovare nella mail).
                </p>
                <input
                  v-model="enteredToken"
                  maxlength="6"
                  placeholder="Es. A1B2C3"
                  class="border rounded w-full p-2 mb-2"
                />
                <p class="text-red-600 mb-2" v-if="tokenError">
                  {{ tokenError }}
                </p>
                <div class="flex justify-end gap-2 mt-4">
                  <button
                    class="px-4 py-2 bg-gray-300 rounded"
                    @click="annullaToken"
                  >
                    Annulla
                  </button>
                  <button
                    class="px-4 py-2 bg-blue-600 text-white rounded"
                    @click="confermaToken"
                  >
                    Conferma
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
 import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  import { faBars, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  ref as vueRef,
  watch,
  watchEffect,
} from "vue";
// Update the import path if the file is in a different location, for example:
import { VueCal } from "vue-cal";
import "vue-cal/style";
import "assets/vuecal.css";
import SidebarRooms from "../components/SidebarRooms.vue";
// Update the import path below if your composable is in a different location
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSupabase } from "../composables/useSupabase";
import roomsConfig from "../rooms.json";
import { find } from "lodash";
import { useRouter } from "vue-router";
import { MeetingRoom } from "../enums/MeetingRoom";
import { MeetingRoomList } from "../enums/MeetingRoom";

const router = useRouter();
const rooms = roomsConfig as Array<{ nome: string; colore: string }>;

const selectedRoom = ref();
const selectedRooms = ref([rooms[0].nome, rooms[1].nome, rooms[2].nome]);
const events = ref([]);
const showModal = ref(false);
const form = ref({
  title: "",
  startdate: "",
  enddate: "",
  startTime: "",
  endTime: "",
  email: "",
  piano: "",
});
const notificaRiunioni = ref("");
const showSpinner = ref(false);
const showAlert = ref();
const selectedDate = ref("");
const loading = ref(false);
const vueCalKey = ref(0);
const vuecalRef = vueRef();
const toastMessage = ref("");
const toastType = ref("success");
const showTokenModal = ref(false);
const draggedEvent = ref<any>(null);
const enteredToken = ref("");
const isOpen = ref(true);
const tokenError = ref("");
const viewStart = ref(
  (() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const start = new Date(today);
    start.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return start;
  })()
);

const viewEnd = ref(
  (() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const end = new Date(today);
    end.setDate(today.getDate() + (6 - ((dayOfWeek + 6) % 7)));
    end.setHours(23, 59, 59, 999);
    return end;
  })()
);
const supabase = useSupabase();
let realtimeSub: RealtimeChannel | null = null;

function onViewChange({ start, end }: { start: Date; end: Date }) {
  viewStart.value = start;
  viewEnd.value = end;
  fetchEvents(selectedRoom.value);
}

function setRoom() {
  const idOf = selectedRooms.value.indexOf(selectedRoom.value);

  if (idOf !== -1 && selectedRooms.value.length === 1) {
    notificaRiunioni.value = `<div class="flex items-center p-4 mb-4 text-sm text-orange-800 border border-orange-300 rounded-lg bg-orange-50" role="alert">
  <svg class="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
  </svg>
  <span class="sr-only">Warn</span>
  <div>
    <span class="font-medium">ATTENZIONE!!!</span> Non puoi rimuovere tutti i piani🧐.
  </div>
</div>`;
    setTimeout(() => {
      notificaRiunioni.value = "";
    }, 6000);
    return;
  }

  if (idOf !== -1) {
    selectedRooms.value.splice(idOf, 1);
    notificaRiunioni.value = "";
    return;
  }

  selectedRooms.value.push(selectedRoom.value);
  notificaRiunioni.value = "";
}

function roundToStep(date: Date, stepMinutes: number = 30): Date {
  const ms = date.getTime();
  const stepMs = stepMinutes * 60 * 1000;
  const rounded = Math.floor(ms / stepMs) * stepMs;
  return new Date(rounded);
}

function spinnerActive(piano, title, startTime, endTime, email){

  if(piano && title && startTime && endTime && email){

    return showSpinner.value = true;
  }
}

const fetchEvents = async (room = "") => {
  // loading.value = true;
  if (!viewStart.value || !viewEnd.value) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

    const start = new Date(today);
    start.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    viewStart.value = start;
    viewEnd.value = end;
  }

  //setRoom();

  const { data, error } = await supabase
    .from("prenotazioni")
    .select("*")
    //.in("room", selectedRooms.value)
    .gte("enddate", viewStart.value.toISOString())
    .lte("startdate", viewEnd.value.toISOString());

  console.log(selectedRoom);

  if (!error && data) {
    events.value = data;
  }
  // loading.value = false;
};

const eventsForCalendar = computed(() => {
  const mapped = events.value
    .map((ev) => {
      const room = rooms.find((r) => r.nome === ev.room);
      let color = "#e5e7eb"; // grigio chiaro di default
      if (ev.room === selectedRoom.value) {
        color = room?.colore || color;
      } else if (room?.colore) {
        color = room.colore + "33"; // aggiunge trasparenza (es: #3b82f633)
      }

      if (!selectedRooms.value.includes(ev.room)) {
        return null;
      }

      return {
        id: ev.id,
        title: ev.title,
        room: ev.room,
        email: ev.email,
        start: new Date(ev.startdate),
        end: new Date(ev.enddate),
        color,
        class: selectedRooms.value.includes(ev.room) ? room.class : "hidden!",
        content: `
        <strong>${ev.email}</strong><br/>
    `,
      };
    })
    .filter((ev) => ev !== null);
  console.log("eventsForCalendar:", mapped);
  return mapped;
});

watchEffect(() => {
  // This will run whenever events, selectedRooms, or selectedRoom change
  showAlert.value = events.value.some(
    (ev) => !selectedRooms.value.includes(ev.room)
  );
});

const onEventClick = ({ event }: { event: any }) => {
  // Reindirizza alla pagina di dettaglio
  router.push(`/prenotazione?id=${event.id}`);
};

const pad = (n: number) => n.toString().padStart(2, "0");

const onCellClick = ({ e, cell, cursor }: any) => {
  form.value.piano = selectedRoom.value;
  const baseDate = cursor.date || new Date();
  const startdate = roundToStep(new Date(baseDate));
  // Arrotonda i minuti: se 0-29 => 00, se 30-59 => 30

  if (new Date(baseDate).getTime() < Date.now()) {
   alert("Orario invalido, scegli per un momento futuro!");
   return;
   }

  const enddate = new Date(startdate.getTime() + 60 * 60 * 1000);
  // Salva la data selezionata (yyyy-mm-dd)
  selectedDate.value = startdate.toISOString().slice(0, 10);
  // Usa orario locale per startTime/endTime
  form.value = {
    title: "",
    startTime: pad(startdate.getHours()) + ":" + pad(startdate.getMinutes()),
    endTime: pad(enddate.getHours()) + ":" + pad(enddate.getMinutes()),
    email: "",
    startdate: "",
    enddate: "",
    piano: (selectedRooms.value.length === 1) ? selectedRooms.value[0] : "",
  };
  showModal.value = true;
  showSpinner.value = false;
};

const showToast = (message: string, type: string = "success") => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = "";
  }, 3500);
};

const addEvent = async () => {
  if (
    !form.value.title ||
    !form.value.startTime ||
    !form.value.endTime ||
    !form.value.email ||
    form.value.piano === "form.piano"
  ) {
    showToast("Compila tutti i campi!", "error");
    return;
  }
  // Combina la data selezionata con gli orari del form in locale
  const startdate = new Date(`${selectedDate.value}T${form.value.startTime}`);
  const enddate = new Date(`${selectedDate.value}T${form.value.endTime}`);
  const newEvent = {
    title: form.value.title,
    email: form.value.email,
    startdate: startdate.toISOString(),
    enddate: enddate.toISOString(),
    room: form.value.piano,
  };
  console.log("Invio a Supabase:", newEvent, JSON.stringify(newEvent));

  const response = await supabase.functions.invoke("check-room-availability", {
    body: newEvent,
  });

  if (response.data !== null) {
    showToast("Prenotazione salvata!", "success");
    showModal.value = false;
  } else {
    const error = await response.error.context.json();
    showToast(error.error || "Errore nel salvataggio!", "error");
  }
};

const onEventDrop = async ({ e, event, overlaps, cell, external }) => {
  event.start = roundToStep(new Date(event.start));
  event.end = roundToStep(new Date(event.end));

  // Sovrascrivi l'evento con gli orari arrotondati

  const hasOverlap = events.value.some((ev) => {
    if (ev.id === event.id || ev.room !== selectedRoom.value) return false;

    const evStart = new Date(ev.startdate);
    const evEnd = new Date(ev.enddate);
    const dropStart = new Date(event.start);
    const dropEnd = new Date(event.end);

    // Controlla sovrapposizione
    return dropStart < evEnd && dropEnd > evStart;
  });
  if (hasOverlap) {
    showToast("Impossibile spostare: ci sono sovrapposizioni!", "error");
    return false; // Non permettere lo spostamento se ci sono sovrapposizioni
  }

  // event contiene l'evento spostato con le nuove date
  // Aggiorna su Supabase le nuove date

  draggedEvent.value = { ...event };
  enteredToken.value = "";
  tokenError.value = "";
  showTokenModal.value = true;

  // blocca il drop visivamente (vue-cal richiede un false manuale nel callback, ma qui posticipiamo la logica)
  return false;
};
function annullaToken() {
  draggedEvent.value = null;
  showTokenModal.value = false;
  enteredToken.value = "";
  tokenError.value = "";
  // Ricarica eventi per forzare reset visuale
  fetchEvents();
}

async function confermaToken() {
  const { data, error } = await supabase
    .from("token_prenotazioni")
    .select("*")
    .eq("booking_id", draggedEvent.value.id)
    .eq("token", enteredToken.value)
    .maybeSingle();

  if (error || !data) {
    tokenError.value = "Token non valido.";
    return;
  }

  // Token valido → aggiorna prenotazione
  const response = await supabase.functions.invoke("check-room-availability", {
    body: {
      id: draggedEvent.value.id,
      title: draggedEvent.value.title,
      email: draggedEvent.value.email,
      startdate: draggedEvent.value.start.toISOString(),
      enddate: draggedEvent.value.end.toISOString(),
      room: selectedRoom.value,
    },
  });

  if (response.data !== null) {
    showToast("Prenotazione aggiornata!", "success");
  } else {
    const error = await response.error.context.json();
    showToast(error.error || "Errore nel salvataggio!", "error");
  }

  showTokenModal.value = false;
  draggedEvent.value = null;
}
onMounted(() => {
  fetchEvents();

  setInterval(() => {
    vueCalKey.value++;
  }, 1 * 60 * 1000);

  realtimeSub = supabase
    .channel("room-prenotazioni")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "prenotazioni",
      },
      (payload) => {
        console.log("Realtime event received:", payload);
        const item = payload.new || payload.old;
        if (!item) return;
        // Filtro: solo la stanza attiva
        if (item.room !== selectedRoom.value) {
          //controlla se l'evento esiste già nella lista
          // e se è stato spostato in un'altra stanza
          const existing = find(events.value, { id: payload.old?.id });
          if (existing && item.room !== existing.room) {
            events.value = events.value.filter(
              (ev) => ev.id !== payload.old.id
            );
            return;
          }
          return;
        }
        // Filtro: solo eventi nel range visualizzato (esempio ±1 settimana)
        // Sostituisci questi valori con il tuo range visibile se disponibile
        const itemStart = new Date(item.startdate);
        const itemEnd = new Date(item.enddate);
        // Esempio: range ±1 settimana dalla data di oggi
        if (!viewStart.value || !viewEnd.value) {
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

          const start = new Date(today);
          start.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
          start.setHours(0, 0, 0, 0);

          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);

          viewStart.value = start;
          viewEnd.value = end;
        }
        if (itemEnd < viewStart.value || itemStart > viewEnd.value) return;
        // In base a payload.eventType: "INSERT", "UPDATE", "DELETE"
        if (payload.eventType === "INSERT") {
          // Evita duplicati: aggiungi solo se non esiste già
          if (!events.value.some((ev) => ev.id === payload.new.id)) {
            events.value.push(payload.new);
          }
        } else if (payload.eventType === "UPDATE") {
          const isInRoom = payload.new?.room === selectedRoom.value;

          if (isInRoom) {
            // evento appena spostato dentro la stanza corrente → lo aggiungi solo se non già presente
            if (!events.value.some((ev) => ev.id === payload.new.id)) {
              events.value.push(payload.new);
            } else {
              const index = events.value.findIndex(
                (ev) => ev.id === payload.new.id
              );
              events.value[index] = payload.new;
            }
          }
        } else if (payload.eventType === "DELETE") {
          events.value = events.value.filter((ev) => ev.id !== payload.old.id);
        }
      }
    )
    .subscribe();
});

onBeforeUnmount(() => {
  if (realtimeSub) supabase.removeChannel(realtimeSub);
});

watch(
  selectedRooms,
  () => {
    fetchEvents();
  },
  { deep: true }
);
</script>

<style>
.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
