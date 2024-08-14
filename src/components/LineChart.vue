<script setup lang="ts">
import { onBeforeMount, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts';
import { type DataFormat } from '@/types';

const props = defineProps<{
  data: DataFormat[],
  xAixs: string[],
}>()

const id = ref('')
const chart = ref<any>(null)

const option = ref({
  tooltip: {},
  xAxis: {
    data: []
  },
  yAxis: {},
  series: []
})

function processData() {
  option.value.xAxis.data = props.xAixs
  option.value.series = props.data.map((item) => {
    return {
      type: 'line',
      name: item.name,
      data: item.data,
      markLine: {
        data: [{ type: 'average', name: 'Avg' }]
      }
    }
  })

  chart.value.setOption(option.value, true)
}

watch(() => props.data, () => {
  processData()
})

onBeforeMount(() => {
  id.value = 'line-chart-' + Math.random().toString(36)
})

onMounted(() => {
  chart.value = echarts.init(document.getElementById(id.value))
  processData()
})

</script>

<template>
  <div :id="id" class="w-full h-full"></div>
</template>