<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useArticleStore } from '@/stores/modules/article'
import { useStatsStore } from '@/stores/modules/stats'
import { useVisitorStore } from '@/stores/modules/visitor'
import VisitorMap from '@/components/VisitorMap.vue'
import VisitorCharts from '@/components/VisitorCharts.vue'
import { ElRow, ElCol, ElCard, ElStatistic, ElButton } from 'element-plus'

const articleStore = useArticleStore()
const statsStore = useStatsStore()
const visitorStore = useVisitorStore()

const barChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const totalArticles = computed(() => articleStore.articles.length)
const totalViews = computed(() =>
  articleStore.articles.reduce((sum, article) => sum + article.viewCount, 0)
)
const totalLikes = computed(() =>
  articleStore.articles.reduce((sum, article) => sum + article.likeCount, 0)
)
const totalViewDuration = computed(() =>
  articleStore.articles.reduce((sum, article) => sum + article.totalViewDuration, 0)
)
const totalVisitors = computed(() => visitorStore.stats?.totalVisitors || 0)

const formattedDuration = computed(() => {
  const hours = Math.floor(totalViewDuration.value / 3600)
  const minutes = Math.floor((totalViewDuration.value % 3600) / 60)
  return `${hours}h ${minutes}m`
})

function initBarChart() {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)
  const sortedArticles = [...articleStore.articles]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)

  const option: echarts.EChartsOption = {
    title: {
      text: '文章浏览量排行 TOP 10',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
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
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: sortedArticles.map((a) => a.title.substring(0, 15) + (a.title.length > 15 ? '...' : '')),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '浏览量',
    },
    series: [
      {
        name: '浏览量',
        type: 'bar',
        data: sortedArticles.map((a) => a.viewCount),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
        },
      },
    ],
  }
  barChart.setOption(option)
}

function initPieChart() {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  const likesData = articleStore.articles
    .filter((a) => a.likeCount > 0)
    .map((a) => ({
      name: a.title.substring(0, 20) + (a.title.length > 20 ? '...' : ''),
      value: a.likeCount,
    }))
    .slice(0, 8)

  const option: echarts.EChartsOption = {
    title: {
      text: '点赞分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '点赞数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: likesData.length > 0 ? likesData : [{ name: '暂无数据', value: 0 }],
      },
    ],
  }
  pieChart.setOption(option)
}

function handleResize() {
  barChart?.resize()
  pieChart?.resize()
}

async function loadData() {
  await Promise.all([
    articleStore.fetchArticles(),
    statsStore.fetchErrorStats(),
    visitorStore.fetchStats(),
  ])
}

onMounted(async () => {
  await loadData()
  initBarChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<template>
  <div class="dashboard-container">
    <ElRow :gutter="20" class="stats-row">
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <ElStatistic
            title="总文章数"
            :value="totalArticles"
            :value-style="{ color: '#409EFF' }"
          >
            <template #prefix>
              <span style="margin-right: 8px">📝</span>
            </template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <ElStatistic
            title="总浏览量"
            :value="totalViews"
            :value-style="{ color: '#67C23A' }"
          >
            <template #prefix>
              <span style="margin-right: 8px">👁️</span>
            </template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <ElStatistic
            title="总点赞数"
            :value="totalLikes"
            :value-style="{ color: '#F56C6C' }"
          >
            <template #prefix>
              <span style="margin-right: 8px">❤️</span>
            </template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <ElStatistic
            title="总浏览时长"
            :value="formattedDuration"
            :value-style="{ color: '#E6A23C' }"
          >
            <template #prefix>
              <span style="margin-right: 8px">⏱️</span>
            </template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card">
          <ElStatistic
            title="总访客数"
            :value="totalVisitors"
            :value-style="{ color: '#9C27B0' }"
          >
            <template #prefix>
              <span style="margin-right: 8px">🌍</span>
            </template>
          </ElStatistic>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="chart-row">
      <ElCol :xs="24" :lg="16">
        <ElCard shadow="hover">
          <div ref="barChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :lg="8">
        <ElCard shadow="hover">
          <div ref="pieChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="stats-row">
      <ElCol :span="24">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🌍 访客地理分布</span>
            </div>
          </template>
          <VisitorMap :stats="visitorStore.stats" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="stats-row" v-if="visitorStore.stats">
      <ElCol :span="24">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📊 访客统计图表</span>
            </div>
          </template>
          <VisitorCharts :stats="visitorStore.stats" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="stats-row" v-if="statsStore.errorStats">
      <ElCol :span="24">
        <ElCard shadow="hover">
          <template #header>
            <div class="card-header">
              <span>错误统计</span>
              <ElButton type="danger" size="small" @click="statsStore.clearErrorStats">
                清空统计
              </ElButton>
            </div>
          </template>
          <div class="error-stats">
            <p class="error-total">
              总错误数: <strong>{{ statsStore.errorStats.totalErrors }}</strong>
            </p>
            <div class="error-list">
              <div
                v-for="error in statsStore.errorStats.errors"
                :key="error.path + error.method"
                class="error-item"
              >
                <span class="error-path">{{ error.method }} {{ error.path }}</span>
                <span class="error-type">{{ error.errorType }}</span>
                <span class="error-count">× {{ error.count }}</span>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-stats {
  .error-total {
    margin-bottom: 16px;
    font-size: 16px;
  }

  .error-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .error-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;

    .error-path {
      font-family: monospace;
      color: #409eff;
      flex: 1;
    }

    .error-type {
      color: #f56c6c;
      font-weight: 500;
    }

    .error-count {
      color: #909399;
    }
  }
}
</style>
