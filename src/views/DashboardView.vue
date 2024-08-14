<script setup lang="ts">
import { onBeforeMount, ref, computed, onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMachine } from '@xstate/vue'

import LineChart from '@/components/LineChart.vue';
import PieChart from '@/components/PieChart.vue';
import ScatterChart from '@/components/ScatterChart.vue';
import CrossChart from '@/components/CrossChart.vue';

import { DataIndex } from '@/types';
import { parseTimeRangeToList } from '@/utils';
import stateMachine from '@/states/dashboard'
import useDataStore from '@/stores/data';

const { send, actorRef } = useMachine(stateMachine);

const dataStore = useDataStore();
const { getStoreData } = dataStore;
const { timeRange, currencyRatio } = storeToRefs(dataStore);

const selectedIndex = ref<DataIndex>(DataIndex.REQUEST);

const dataOption = ref<{ label: string; value: DataIndex }[]>([
  { label: 'Request', value: DataIndex.REQUEST },
  { label: 'Impression', value: DataIndex.IMPRESSION },
  { label: 'Revenue', value: DataIndex.REVENUE },
  { label: 'eCPM', value: DataIndex.ECPM },
  { label: 'RPM', value: DataIndex.RPM }
]);

const lineChartData = ref<[]>([]);
const unitData = ref<[]>([]);

const subscribe = ref<any>(null)

const lineAxis = computed(() => {
  return parseTimeRangeToList(timeRange.value);
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

const ecpmPieChart = computed(() => {
  return unitData.value.map((record) => {
    const [unitId, impression, request, revenue] = record as any;
    return {
      name: unitId,
      value: impression === 0 ? 0 : (revenue / impression) * 1000 * currencyRatio.value,
    }
  }).sort((a, b) => b.value - a.value).slice(0, 10);
});

const rpmPieChart = computed(() => {
  return unitData.value.map((record) => {
    const [unitId, impression, request, revenue] = record as any;
    return {
      name: unitId,
      value: request === 0 ? 0 : (revenue / request) * 1000 * currencyRatio.value,
    }
  }).sort((a, b) => b.value - a.value).slice(0, 10);
});

const scatterData = computed(() => {
  return unitData.value.map((record) => {
    const [unitId, impression, request, revenue] = record as any;
    return {
      name: unitId,
      value: [impression, request]
    }
  });
});

const crossData = computed(() => {
  return unitData.value.map((record) => {
    const [unitId, impression, request, revenue] = record as any;
    return {
      name: unitId,
      value: [
        impression === 0 ? 0 : (revenue / impression) * 1000 * currencyRatio.value,
        request === 0 ? 0 : (revenue / request) * 1000 * currencyRatio.value,
        revenue * currencyRatio.value
      ]
    }
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
      case 'getData':
        lineChartData.value = await getStoreData(`SELECT date, SUM(impression), SUM(request), SUM(revenue) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY date ORDER BY date DESC;`)
        unitData.value = await getStoreData(`SELECT unitId, SUM(impression), SUM(request), SUM(revenue) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY unitId`)
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
  <div class="flex h-96">
    <div class="w-2/5">
      <div class="flex h-1/2">
        <div class="w-1/2 h-full">
          <PieChart :title="'Top 10 eCPM overview'" :data="ecpmPieChart" v-if="ecpmPieChart.length !== 0"></PieChart>
        </div>
        <div class="w-1/2 h-full">
          <PieChart :title="'Top 10 RPM overview'" :data="rpmPieChart" v-if="rpmPieChart.length !== 0"></PieChart>
        </div>
      </div>
      <div class="h-1/2">
        <ScatterChart :x-title="'Impression'" :y-title="'Request'" :title="'Impress v.s. Request'" :data="scatterData"
          v-if="unitData.length !== 0">
        </ScatterChart>
      </div>
    </div>
    <div class="w-3/5 h-full">
      <CrossChart :title="'eCPM v.s. RPM'" :x-title="'eCPM'" :y-title="'RPM'" :data="crossData"
        v-if="unitData.length !== 0">
      </CrossChart>
    </div>
  </div>
</template>
