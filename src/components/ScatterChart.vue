<script setup lang="ts">
import { onBeforeMount, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts';
// import { transform } from 'echarts-stat';
import ecStat from 'echarts-stat';
import { type DataFormat } from '@/types';

const props = defineProps<{
  xTitle: string,
  yTitle: string,
  data: DataFormat[],
  title: string,
}>()

const id = ref('')
const chart = ref<any>(null)

const option = ref({
  grid: {
    bottom: '32px',
    left: '80px',
    right: '80px'
  },
  title: {
    text: '',
  },
  xAxis: [],
  yAxis: [],
  dataset: [
    {
      source: [
      ]
    },
    {
      transform: {
        type: 'ecStat:regression',
        config: {
          method: 'linear',
        }
      }
    }],
  series: [
    {
      symbolSize: 8,
      type: 'scatter',
      datasetIndex: 0,
    },
    {
      name: 'line',
      type: 'line',
      smooth: true,
      datasetIndex: 1,
      symbolSize: 0.1,
      symbol: 'circle',
      label: { show: true, fontSize: 16 },
      labelLayout: { dx: -20 },
      encode: { label: 2, tooltip: 1 }
    }
  ]
})

function processData() {
  option.value.title.text = props.title
  option.value.xAxis = [{
    name: props.xTitle,
    type: 'value'
  }]
  option.value.yAxis = [{
    name: props.yTitle,
    type: 'value'
  }]

  option.value.dataset[0].source = props.data.map((item) => {
    return item.value
  })

  chart.value.setOption(option.value, true)
}

watch(() => props.data, () => {
  processData()
})

onBeforeMount(() => {
  id.value = 'scatter-chart-' + Math.random().toString(36)
})

onMounted(() => {
  echarts.registerTransform(ecStat.transform.regression);
  chart.value = echarts.init(document.getElementById(id.value))
  processData()
})

</script>

<template>
  <div :id="id" class="w-full h-full"></div>
</template>