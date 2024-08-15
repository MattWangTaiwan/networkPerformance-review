<script setup lang="ts">
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { onBeforeMount, ref, computed, onBeforeUnmount, watch, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { VxeTable, VxeColumn, VxeColgroup } from 'vxe-table'
import { useMachine } from '@xstate/vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import { type UnitRecord } from '@/types'
import stateMachine from '@/states/report'
import useDataStore from '@/stores/data'

const { send, actorRef } = useMachine(stateMachine)

const dataStore = useDataStore()
const { getStoreData } = dataStore
const { timeRange, currencyRatio } = storeToRefs(dataStore)

const subscribe = ref<any>(null)
const tableData = ref<UnitRecord[]>([])
const avgData = ref([])
const searchUnitId = ref<string>('')

const dataProcessor = reactive({
  isMore: true,
  limit: 500,
  offset: 0,
  getData: async function () {
    tableData.value = []
    const timer = setInterval(async () => {
      if (!this.isMore) {
        clearTimeout(timer)
        return
      }
      const result = await getStoreData(`SELECT date, unitId, impression, request, revenue, ecpm, rpm FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' ORDER BY unitId LIMIT ${this.limit} OFFSET ${this.offset}`)
      this.offset += this.limit
      this.isMore = result.length === this.limit
      tableData.value = tableData.value.concat(result)
    }, 2000)
  },
})

const parseTableData = computed(() => {
  return tableData.value.map((record: any) => {
    const [date, unitId, impression, request, revenue, ecpm, rpm] = record
    const avgItem = avgData.value.find((item: any) => item[0] === unitId)
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
  })
})

const filterTableData = computed(() => {
  return parseTableData.value.filter((record: any) => {
    return searchUnitId.value === '' || record.unitId.includes(searchUnitId.value)
  })
})

const formatNumber = ({ cellValue }) => {
  return cellValue.includes('-') ? `<span class="text-red-400">${cellValue}</span>` : `<span class="text-blue-400">${cellValue}</span>`
}

function getDiff(target: number, base: number) {
  return base === 0 ? '--' : `${((target - base) / base * 100).toFixed(1)}%`
}

function onDownload() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Unit Report')

  worksheet.getRow(1).values = ['Date', 'Unit ID', 'Impression', '%', 'Request', '%', 'Revenue', '%', 'eCPM', '%', 'RPM', '%']
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
    ])
  })

  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    FileSaver.saveAs(blob, `unit-report-${dayjs().format('YYYY-MM-DD')}.xlsx`)
  })
}

watch(() => timeRange.value, async () => {
  send({ type: 'GET' })
})

onBeforeMount(() => {
  subscribe.value = actorRef.subscribe(async (snapshot) => {
    switch (snapshot.value) {
      case 'getData':
        avgData.value = await getStoreData(`SELECT unitId, AVG(impression), AVG(request), AVG(revenue), AVG(ecpm), AVG(rpm) FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' GROUP BY unitId`)
        // tableData.value = await getStoreData(`SELECT date, unitId, impression, request, revenue, ecpm, rpm FROM tbl_unit_reports WHERE date BETWEEN '${timeRange.value[0]}' AND '${timeRange.value[1]}' ORDER BY unitId`)
        dataProcessor.getData()
        send({ type: 'NEXT' })
        break
      case 'viewData':
        break
    }
  })
})

onBeforeUnmount(() => {
  if (subscribe.value) subscribe.value.unsubscribe()
})
</script>

<template>
  <div class="flex mb-2 items-center">
    <div class="text-xl">Units 
      <span class="text-sm">({{ filterTableData.length }})</span>
    </div>
    <svg aria-hidden="true" class="inline w-6 h-6 text-gray-200 animate-spin fill-blue-400 ml-4"
      viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="dataProcessor.isMore">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor" />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill" />
    </svg>
    <input type="text" class="w-40 ml-auto mr-2" v-model="searchUnitId" placeholder="Search Unit ID">
    <div class="button" @click="onDownload">
      <font-awesome-icon :icon="faDownload" />
    </div>
  </div>
  <div class="h-[calc(100%-4rem)]">
    <vxe-table :data="filterTableData" :scroll-y="{enabled: true, gt: 0}" height="auto">
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
  </div>
</template>
