<script setup lang="ts">
import { onBeforeMount, ref, computed, onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { VxeTable, VxeColumn } from 'vxe-table';
import { useMachine } from '@xstate/vue'

import LineChart from '@/components/LineChart.vue';

import { DataIndex, type UnitRecord } from '@/types';
import { parseTimeRangeToList, currencyMap } from '@/utils';
import stateMachine from '@/states/home'
import useDataStore from '@/stores/data';

const { send, actorRef } = useMachine(stateMachine);

const dataStore = useDataStore();
const { fetchData, initialize, getStoreData } = dataStore;
const { timeRange, currency } = storeToRefs(dataStore);

const selectedIndex = ref<DataIndex>(DataIndex.REQUEST);

const dataOption = ref<{ label: string; value: DataIndex }[]>([
  { label: 'Request', value: DataIndex.REQUEST },
  { label: 'Impression', value: DataIndex.IMPRESSION },
  { label: 'Revenue', value: DataIndex.REVENUE },
  { label: 'eCPM', value: DataIndex.ECPM },
  { label: 'RPM', value: DataIndex.RPM }
]);

const subscribe = ref<any>(null)
const tableData = ref<UnitRecord[]>([]);
const searchUnitId = ref<string>('');
const lineChartData = ref<[]>([]);

const currencyRatio = computed(() => {
  return currencyMap.get(currency.value) || 1;
});

const lineChart = computed(() => {
  return [
    {
      name: DataIndex.REQUEST,
      data: lineAxis.value.map((date: string) => {
        const record = lineChartData.value.find((record) => record[0] === date);
        if (record) {
          const [date, impression, request, revenue] = record as any;
          switch (selectedIndex.value) {
            case DataIndex.REQUEST:
              return request;
            case DataIndex.IMPRESSION:
              return impression;
            case DataIndex.REVENUE:
              return revenue * currencyRatio.value;
            case DataIndex.ECPM:
              return impression === 0 ? 0 : (revenue / impression) * 1000 * currencyRatio.value;
            case DataIndex.RPM:
              return request === 0 ? 0 : (revenue / request) * 1000 * currencyRatio.value;
          }
        }
        return 0;
      })
    }
  ]
});

const lineAxis = computed(() => {
  return parseTimeRangeToList(timeRange.value);
});

const parseTableData = computed(() => {
  return tableData.value.map((record: any) => {
    const [unitId, impression, request, revenue] = record
    return {
      unitId,
      impression,
      request,
      revenue: revenue * currencyRatio.value,
      ecpm: impression === 0 ? 0 : (revenue / impression) * 1000 * currencyRatio.value,
      rpm: request === 0 ? 0 : (revenue / request) * 1000 * currencyRatio.value
    }
  });
});

const filterTableData = computed(() => {
  return parseTableData.value.filter((record: any) => {
    return searchUnitId.value === '' || record.unitId.includes(searchUnitId.value);
  });
});

watch(() => timeRange.value, async () => {
  send({ type: 'GET' });
});

function onSelect(value: DataIndex) {
  selectedIndex.value = value
}

onBeforeMount(() => {
  subscribe.value = actorRef.subscribe(async (snapshot) => {
    switch (snapshot.value) {
      case 'initial':
        await initialize();
        await fetchData();
        send({ type: 'NEXT' });
        break;
      case 'getData':
        lineChartData.value = await getStoreData(`SELECT date, SUM(impression), SUM(request), SUM(revenue) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY date ORDER BY date DESC;`)
        tableData.value = await getStoreData(`SELECT unitId, SUM(impression), SUM(request), SUM(revenue) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY unitId`)
        send({ type: 'NEXT' });
        break;
      case 'viewData':
        break;
    }
  });
});

onBeforeUnmount(() => {
  if (subscribe.value) subscribe.value.unsubscribe();
});
</script>

<template>
  <div class="text-xl mb-2">Performance Overview</div>
  <div class="flex mb-2">
    <div class="button" :class="[selectedIndex === opt.value ? 'select' : '']" @click="onSelect(opt.value)"
      v-for="opt in dataOption" :key="opt.value">{{ opt.label }}</div>
  </div>
  <div class="w-full h-72 border border-gray-300 mb-4" :class="[lineChartData.length === 0 ? 'bg-gray-300' : '']">
    <LineChart :x-aixs="lineAxis" :data="lineChart" v-if="lineChartData.length !== 0"></LineChart>
  </div>
  <div class="flex mb-2 justify-between items-center">
    <div class="text-xl">Units <span class="text-sm">({{ filterTableData.length }})</span></div>
    <input type="text" class="w-40" v-model="searchUnitId" placeholder="Search Unit ID">
  </div>
  <vxe-table :data="filterTableData">
    <vxe-column field="unitId" title="Unit ID" sortable></vxe-column>
    <vxe-column field="request" title="Request" sortable></vxe-column>
    <vxe-column field="impression" title="Impression" sortable></vxe-column>
    <vxe-column field="revenue" title="Revenue" sortable></vxe-column>
    <vxe-column field="ecpm" title="eCPM" sortable></vxe-column>
    <vxe-column field="rpm" title="RPM" sortable></vxe-column>
  </vxe-table>
</template>

<style>
input[type="text"] {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5;
}
</style>
