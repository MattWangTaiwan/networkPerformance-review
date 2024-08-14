<script setup lang="ts">
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { onBeforeMount, ref, computed, onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { VxeTable, VxeColumn, VxeColgroup } from 'vxe-table';
import { useMachine } from '@xstate/vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import { type UnitRecord } from '@/types';
import stateMachine from '@/states/report'
import useDataStore from '@/stores/data';

const { send, actorRef } = useMachine(stateMachine);

const dataStore = useDataStore();
const { getStoreData } = dataStore;
const { timeRange, currencyRatio } = storeToRefs(dataStore);

const subscribe = ref<any>(null)
const tableData = ref<UnitRecord[]>([]);
const avgData = ref([]);
const searchUnitId = ref<string>('');

const parseTableData = computed(() => {
  return tableData.value.map((record: any) => {
    const [date, unitId, impression, request, revenue, ecpm, rpm] = record
    const avgItem = avgData.value.find((item: any) => item[0] === unitId);
    return {
      date,
      unitId,
      impression,
      impressionDiff: avgItem ? getDiff(impression, avgItem[1]) : 0,
      request,
      requestDiff: avgItem ? getDiff(request, avgItem[2]) : 0,
      revenue: revenue * currencyRatio.value,
      revenueDiff: avgItem ? getDiff(revenue, avgItem[3]) : 0,
      ecpm: ecpm * currencyRatio.value,
      ecpmDiff: avgItem ? getDiff(ecpm, avgItem[4]) : 0,
      rpm: rpm * currencyRatio.value,
      rpmDiff: avgItem ? getDiff(rpm, avgItem[5]) : 0
    }
  });
});

const filterTableData = computed(() => {
  return parseTableData.value.filter((record: any) => {
    return searchUnitId.value === '' || record.unitId.includes(searchUnitId.value);
  });
});

const formatNumber = ({ cellValue }) => {
  return cellValue.includes('-') ? `<span class="text-red-400">${cellValue}</span>` : `<span class="text-blue-400">${cellValue}</span>`;
}

function getDiff(target: number, base: number) {
  return base === 0 ? '--' : `${((target - base) / base * 100).toFixed(1)}%`;
}

function onDownload() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Unit Report');

  worksheet.getRow(1).values = ['Date', 'Unit ID', 'Impression', '%', 'Request', '%', 'Revenue', '%', 'eCPM', '%', 'RPM', '%'];
  filterTableData.value.forEach((record, index) => {
    worksheet.addRow([
      record.date,
      record.unitId,
      record.impression,
      record.impressionDiff,
      record.request,
      record.requestDiff,
      record.revenue,
      record.revenueDiff,
      record.ecpm,
      record.ecpmDiff,
      record.rpm,
      record.rpmDiff
    ]);
  });

  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, `unit-report-${dayjs().format('YYYY-MM-DD')}.xlsx`);
  })
}

watch(() => timeRange.value, async () => {
  send({ type: 'GET' });
});

onBeforeMount(() => {
  subscribe.value = actorRef.subscribe(async (snapshot) => {
    switch (snapshot.value) {
      case 'getData':
        avgData.value = await getStoreData(`SELECT unitId, AVG(impression), AVG(request), AVG(revenue), AVG(ecpm), AVG(rpm) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY unitId`)
        tableData.value = await getStoreData(`SELECT date, unitId, impression, request, revenue, ecpm, rpm FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' ORDER BY unitId`)
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
  <div class="flex mb-2 items-center">
    <div class="text-xl">Units <span class="text-sm">({{ filterTableData.length }})</span></div>
    <input type="text" class="w-40 ml-auto mr-2" v-model="searchUnitId" placeholder="Search Unit ID">
    <div class="button" @click="onDownload">
      <font-awesome-icon :icon="faDownload" />
    </div>
  </div>
  <vxe-table :data="filterTableData">
    <vxe-column field="unitId" title="Unit ID" sortable></vxe-column>
    <vxe-column field="date" title="Date Time" sortable></vxe-column>
    <vxe-colgroup title="Request" align="center">
      <vxe-column field="request" sortable></vxe-column>
      <vxe-column field="requestDiff" type="html" :formatter="formatNumber"></vxe-column>
    </vxe-colgroup>
    <vxe-colgroup title="Impression" align="center">
      <vxe-column field="impression" sortable></vxe-column>
      <vxe-column field="impressionDiff" type="html" :formatter="formatNumber"></vxe-column>
    </vxe-colgroup>
    <vxe-colgroup title="Revenue" align="center">
      <vxe-column field="revenue" sortable></vxe-column>
      <vxe-column field="revenueDiff" type="html" :formatter="formatNumber"></vxe-column>
    </vxe-colgroup>
    <vxe-colgroup title="eCPM" align="center">
      <vxe-column field="ecpm" sortable></vxe-column>
      <vxe-column field="ecpmDiff" type="html" :formatter="formatNumber"></vxe-column>
    </vxe-colgroup>
    <vxe-colgroup title="RPM" align="center">
      <vxe-column field="rpm" sortable></vxe-column>
      <vxe-column field="rpmDiff" type="html" :formatter="formatNumber"></vxe-column>
    </vxe-colgroup>
  </vxe-table>
</template>
