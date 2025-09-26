<template>
  <div class="max-w-xl mx-auto mt-10 p-6 border rounded bg-white shadow">
    <h1 class="text-2xl font-bold mb-4">Prenotazione</h1>
    <button
      @click="router.push('/')"
      class="mb-6 text-blue-600 hover:underline text-sm flex items-center gap-1"
    >
      <span>←</span> <span>Torna alla Home</span>
    </button>

    <div v-if="booking">
      <h2 class="text-xl font-semibold mb-2">{{ booking.title }}</h2>
      <p><strong>Sala:</strong> {{ booking.room }}</p>
      <p><strong>Email:</strong> {{ booking.email }}</p>
      <p>
        <strong>Data:</strong> {{ formatDate(booking.startdate) }}<br />
        <strong>Orario:</strong> {{ formatTime(booking.startdate) }} -
        {{ formatTime(booking.enddate) }}
      </p>

      <div class="mt-6 border-t pt-4">
        <p v-if="!valid" class="mb-2">
          Inserisci il codice di sicurezza (puoi trovarlo nella mail) per modificare o cancellare:
        </p>
        <input
          v-model="enteredToken"
          maxlength="6"
          class="border rounded w-full p-2 mb-2"
          placeholder="Es. A1B2C3"
          v-if="!valid"
        />
        <button
          @click="verifyToken"
          class="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          v-if="!valid"
        >
          Verifica codice
        </button>
        <p v-if="error" class="text-red-600 mb-2">{{ error }}</p>

        <div class="flex gap-4 mt-4">
          <button
            class="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
            :disabled="!valid"
            @click="modificaPrenotazione"
          >
            Modifica
          </button>
          <button
            class="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            :disabled="!valid"
            @click="cancellaPrenotazione"
          >
            Cancella
          </button>
        </div>

        <!-- FORM MODIFICA -->
        <div v-if="editing" class="mt-6 border-t pt-4">
          <h3 class="text-lg font-semibold mb-4">Modifica prenotazione</h3>
          <form @submit.prevent="salvaModifica">
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
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="editing = false"
                class="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Annulla
              </button>
              <button
                type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Salva modifiche
              </button>
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
    </div>
    <div v-else class="text-gray-500">Prenotazione non trovata.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSupabase } from "../composables/useSupabase";

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const bookingId = route.query.id as string;
const toastType = ref("success");
const toastMessage = ref("");

const enteredToken = ref("");
const valid = ref(false);
const error = ref("");
const booking = ref<any>(null);
const editing = ref(false);
const form = ref({
  title: "",
  email: "",
  startTime: "",
  endTime: "",
});

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("it-IT");
const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

onMounted(async () => {
  if (!bookingId) return;

  const { data: bookingData, error: bookingError } = await supabase
    .from("prenotazioni")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (!bookingError && bookingData) {
    booking.value = bookingData;
  }

  const urlToken = route.query.token as string;
  const urlAction = (route.query.action as string)?.toUpperCase();

  if (urlToken) {
    enteredToken.value = urlToken;
    const isValid = await verifyTokenSilently();

    if (isValid) {
      if (urlAction === "MODIFY") {
        modificaPrenotazione();
      } else if (urlAction === "DELETE") {
        cancellaPrenotazione();
      }
    }
  } else {
    valid.value = false;
  }
});

async function verifyTokenSilently(): Promise<boolean> {
  const { data, error: tokenError } = await supabase
    .from("token_prenotazioni")
    .select()
    .eq("booking_id", bookingId)
    .eq("token", enteredToken.value)
    .maybeSingle();

  if (tokenError || !data) {
    showToast("Token non valido o scaduto.");
    return false;
  }

  valid.value = true;
  router.replace({ query: { id: bookingId } });
  return true;
}
const showToast = (message: string, type: string = "danger") => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = "";
  }, 3500);
};
async function verifyToken() {
  error.value = "";
  const { data, error: tokenError } = await supabase
    .from("token_prenotazioni")
    .select()
    .eq("booking_id", bookingId)
    .eq("token", enteredToken.value)
    .maybeSingle();

  if (tokenError) {
    showToast("Errore nella verifica del token.");
    return;
  }

  if (!data) {
    showToast("Token non valido.");
    return;
  }

  valid.value = true;
  router.replace({ query: { id: bookingId } });
}

function modificaPrenotazione() {
  if (!booking.value) return;

  const start = new Date(booking.value.startdate);
  const end = new Date(booking.value.enddate);

  form.value = {
    title: booking.value.title,
    email: booking.value.email,
    startTime: start.toISOString().slice(11, 16),
    endTime: end.toISOString().slice(11, 16),
  };

  editing.value = true;
}

async function salvaModifica() {
  if (!booking.value) return;

  const newStart = new Date(booking.value.startdate);
  const newEnd = new Date(booking.value.startdate);

  const [startHour, startMinute] = form.value.startTime.split(":");
  const [endHour, endMinute] = form.value.endTime.split(":");

  newStart.setHours(+startHour, +startMinute);
  newEnd.setHours(+endHour, +endMinute);

  const updatedData = {
    id: booking.value.id,
    title: form.value.title,
    email: form.value.email,
    startdate: newStart.toISOString(),
    enddate: newEnd.toISOString(),
    room: booking.value.room,
  };

  // 1. Verifica disponibilità via Edge Function
  const response = await supabase.functions.invoke("check-room-availability", {
    body: updatedData,
  });

  if (response.data === null) {
    const errorMsg =
      response.error?.context?.json?.error || "Sovrapposizione rilevata.";
    error.value = errorMsg;
    return;
  }

  // 2. Se tutto ok → aggiorna
  const { error: updateError } = await supabase
    .from("prenotazioni")
    .update(updatedData)
    .eq("id", bookingId);

  if (!updateError) {
    alert("Modifiche salvate.");
    editing.value = false;
    location.reload();
  } else {
    showToast("Errore durante il salvataggio.");
  }
}

async function cancellaPrenotazione() {
  const conferma = confirm(
    "Sei sicuro di voler cancellare questa prenotazione?"
  );
  if (!conferma) return;

  const { error } = await supabase
    .from("prenotazioni")
    .delete()
    .eq("id", bookingId);

  if (!error) {
    alert("Prenotazione cancellata.");
    router.push("/");
  } else {
    showToast("Errore durante la cancellazione.");
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}
</style>
