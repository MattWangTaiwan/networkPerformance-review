<script setup lang="ts">
import { onBeforeMount, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts';
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
  title: {
    text: '',
  },
  grid: {
    bottom: '32px',
    left: '60px',
    right: '60px'
  },
  tooltip: {
    trigger: 'item',
    // formatter: 'UnitId : {b} <br> {c}'
  },
  series: [
    {
      // symbolSize: function (data) {
      //   return Math.sqrt(data[2]);
      // },
      data: [],
      type: 'scatter',
      markLine: {
        data: [
          { type: 'average', name: 'Avg' },
          { type: 'average', name: 'Avg', valueIndex: 0 }
        ]
      },
      itemStyle: {
        opacity: 0.6
      }
    }
  ]
})

function processData() {
  const symbol = [2, 30]
  option.value.xAxis = [{
    name: props.xTitle,
    type: 'value'
  }]
  option.value.yAxis = [{
    name: props.yTitle,
    type: 'value'
  }]

  option.value.title.text = props.title
  option.value.series[0].data = props.data

  const list = props.data.map((item) => item.value[2])
  const min = Math.min(...list)
  const max = Math.max(...list)
  option.value.series[0].symbolSize = function (data) {
    return (((symbol[1] - symbol[0]) / (max - min)) * data[2]) + symbol[0]
  }

  chart.value.setOption(option.value, true)
}

watch(() => props.data, () => {
  processData()
})

onBeforeMount(() => {
  id.value = 'cross-chart-' + Math.random().toString(36)
})

onMounted(() => {
  chart.value = echarts.init(document.getElementById(id.value))
  processData()
})

</script>

<template>
  <div :id="id" class="w-full h-full"></div>
</template>