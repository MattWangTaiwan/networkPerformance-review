<script setup lang="ts">
import { onBeforeMount, ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts';
import { type DataFormat } from '@/types';

const props = defineProps<{
  data: DataFormat[],
  title: string,
}>()

const id = ref('')
const chart = ref<any>(null)

const option = ref({
  title: {
    text: '',
  },
  tooltip: {
    trigger: 'item',
    formatter: 'UnitId : {b} <br> {c}'
  },
  series: [
    {
      name: '',
      type: 'pie',
      radius: '50%',
      data: [],
      label: {
        show: true,
      },
      labelLine: {
        show: true
      },
    }
  ]
})

function processData() {
  option.value.title.text = props.title
  option.value.series[0].data = props.data

  chart.value.setOption(option.value, true)
}

watch(() => props.data, () => {
  processData()
})

onBeforeMount(() => {
  id.value = 'pie-chart-' + Math.random().toString(36)
})

onMounted(() => {
  chart.value = echarts.init(document.getElementById(id.value))
  processData()
})

</script>

<template>
  <div :id="id" class="w-full h-full"></div>
</template>