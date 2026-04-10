<template>
  <div class="visitor-charts">
    <div ref="countryChartRef" class="chart"></div>
    <div ref="cityChartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { VisitorStats } from '@/api/modules/visitor'

const props = defineProps<{
  stats: VisitorStats | null
}>()

const countryChartRef = ref<HTMLElement | null>(null)
const cityChartRef = ref<HTMLElement | null>(null)

let countryChart: echarts.ECharts | null = null
let cityChart: echarts.ECharts | null = null

const initCountryChart = () => {
  if (!countryChartRef.value || !props.stats?.countryStats) return

  if (!countryChart) {
    countryChart = echarts.init(countryChartRef.value)
  }

  const data = props.stats.countryStats.slice(0, 10).map(item => ({
    name: item.country,
    value: item.count,
  }))

  const option: EChartsOption = {
    title: {
      text: '🌍 国家分布',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#303133',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          fontSize: 12,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data,
        color: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe',
          '#00f2fe',
          '#43e97b',
          '#38f9d7',
          '#fa709a',
          '#fee140',
        ],
      },
    ],
  }

  countryChart.setOption(option)
}

const initCityChart = () => {
  if (!cityChartRef.value || !props.stats?.cityStats) return

  if (!cityChart) {
    cityChart = echarts.init(cityChartRef.value)
  }

  const top10 = props.stats.cityStats.slice(0, 10)

  const option: EChartsOption = {
    title: {
      text: '🏙️ 城市分布 Top 10',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#303133',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: top10.map(item => item.city),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '访问次数',
    },
    series: [
      {
        name: '访问次数',
        type: 'bar',
        data: top10.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#764ba2' },
              { offset: 1, color: '#667eea' },
            ]),
          },
        },
      },
    ],
  }

  cityChart.setOption(option)
}

watch(() => props.stats, () => {
  if (props.stats) {
    initCountryChart()
    initCityChart()
  }
}, { deep: true, immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  countryChart?.resize()
  cityChart?.resize()
}

watch(() => props.stats, () => {
  handleResize()
})
</script>

<style scoped>
.visitor-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart {
  width: 100%;
  height: 350px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
}

@media (max-width: 768px) {
  .visitor-charts {
    grid-template-columns: 1fr;
  }
  
  .chart {
    height: 300px;
  }
}
</style>
