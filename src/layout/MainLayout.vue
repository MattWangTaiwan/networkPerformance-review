<script setup lang="ts">
import dayjs from 'dayjs'
import { onBeforeMount, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

import VueDatePicker from '@vuepic/vue-datepicker'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHouse, faChartPie, faTable } from '@fortawesome/free-solid-svg-icons'

import useDataStore from '@/stores/data'

const dataStore = useDataStore();
const { networkProfile, timeRange, currency } = storeToRefs(dataStore);
const { setTimeRange, setCurrency } = dataStore;

const router = useRouter()
const route = useRoute()

const _selectedTime = ref('last14');
const _selectedCurrency = ref('');

const timeOption = ref<{ label: string; value: string }[]>([
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 14 days', value: 'last14' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'Last 60 days', value: 'last60' },
  { label: 'Custom', value: 'custom' }
]);

const currencyOption = ref<{ label: string; value: string }[]>([
  { label: 'TWD', value: 'TWD' }
]);

const selectedTime = computed({
  get: () => _selectedTime.value,
  set: (value: string) => {
    _selectedTime.value = value;
    if (_selectedTime.value !== 'custom') setTimeRange(parseTime(_selectedTime.value));
  }
});

const selectedCurrency = computed({
  get: () => _selectedCurrency.value,
  set: (value: string) => {
    _selectedCurrency.value = value;
    setCurrency(value);
  }
});

const pickTime = computed({
  get: () => timeRange.value,
  set: (value: string[]) => {
    setTimeRange(value);
  }
});

watch(() => currency.value, (newVal, oldVal) => {
  if (oldVal === '') {
    _selectedCurrency.value = currency.value;
    currencyOption.value = [
      { label: currency.value, value: currency.value },
      ...currencyOption.value
    ]
  }
});

function parseTime(time: string = selectedTime.value) {
  switch (time) {
    case 'last7':
      return [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
    case 'last14':
      return [dayjs().subtract(14, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
    case 'last30':
      return [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
    case 'last60':
      return [dayjs().subtract(60, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
    default:
      return [];
  }
}

function onChange(path: string) {
  router.push(path);
}

onBeforeMount(() => {
  setTimeRange(parseTime());
});

</script>

<template>
  <div class="text-2xl mb-2">
    {{ networkProfile?.name || '' }}
  </div>
  <div class="flex gap-2 items-center mb-4">
    <div class="w-60 h-10 leading-10">
      <template v-if="selectedTime !== 'custom'">{{ timeRange[0] }} ~ {{ timeRange[1] }}</template>
      <VueDatePicker v-model="pickTime" :format="'yyyy-MM-dd'" :enable-time-picker="false" :clearable="false" range
        v-else></VueDatePicker>
    </div>
    <select v-model="selectedTime">
      <option :value="item.value" v-for="item in timeOption" :key="item.value">
        {{ item.label }}
      </option>
    </select>
    <select v-model="selectedCurrency" class="ml-auto">
      <option :value="item.value" v-for="item in currencyOption" :key="item.value">
        {{ item.label }}
      </option>
    </select>
    <div class="flex items-center">
      <div class="button" :class="[route.path === '/home' ? 'select' : '']" @click="onChange('/home')">
        <font-awesome-icon :icon="faHouse" />
      </div>
      <div class="button" :class="[route.path === '/dashboard' ? 'select' : '']" @click="onChange('/dashboard')">
        <font-awesome-icon :icon="faChartPie" />
      </div>
      <div class="button" :class="[route.path === '/report' ? 'select' : '']" @click="onChange('/report')">
        <font-awesome-icon :icon="faTable" />
      </div>
    </div>
  </div>
</template>