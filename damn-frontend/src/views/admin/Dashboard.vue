<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useArticleStore } from '@/stores/modules/article'
import { useStatsStore } from '@/stores/modules/stats'
import { useVisitorStore } from '@/stores/modules/visitor'
import VisitorMap from '@/components/VisitorMap.vue'
import VisitorCharts from '@/components/VisitorCharts.vue'
import { ElRow, ElCol, ElCard, ElStatistic, ElButton } from 'element-plus'
import { Document, View, Star, Timer, Position, DataAnalysis, Warning, Delete } from '@element-plus/icons-vue'

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
        color: '#1e293b'
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
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ]),
          borderRadius: [8, 8, 0, 0]
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
        color: '#1e293b'
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
          borderRadius: 12,
          borderColor: '#fff',
          borderWidth: 3,
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
    <ElRow :gutter="24" class="stats-row">
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card card-articles">
          <template #header>
            <div class="stat-icon-wrapper">
              <el-icon class="stat-icon"><Document /></el-icon>
            </div>
          </template>
          <ElStatistic
            title="总文章数"
            :value="totalArticles"
            :value-style="{ color: '#1e293b' }"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card card-views">
          <template #header>
            <div class="stat-icon-wrapper">
              <el-icon class="stat-icon"><View /></el-icon>
            </div>
          </template>
          <ElStatistic
            title="总浏览量"
            :value="totalViews"
            :value-style="{ color: '#1e293b' }"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card card-likes">
          <template #header>
            <div class="stat-icon-wrapper">
              <el-icon class="stat-icon"><Star /></el-icon>
            </div>
          </template>
          <ElStatistic
            title="总点赞数"
            :value="totalLikes"
            :value-style="{ color: '#1e293b' }"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card card-duration">
          <template #header>
            <div class="stat-icon-wrapper">
              <el-icon class="stat-icon"><Timer /></el-icon>
            </div>
          </template>
          <ElStatistic
            title="总浏览时长"
            :value="formattedDuration"
            :value-style="{ color: '#1e293b' }"
          />
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard shadow="hover" class="stat-card card-visitors">
          <template #header>
            <div class="stat-icon-wrapper">
              <el-icon class="stat-icon"><Position /></el-icon>
            </div>
          </template>
          <ElStatistic
            title="总访客数"
            :value="totalVisitors"
            :value-style="{ color: '#1e293b' }"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="24" class="chart-row">
      <ElCol :xs="24" :lg="16">
        <ElCard shadow="hover" class="chart-card">
          <div ref="barChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :lg="8">
        <ElCard shadow="hover" class="chart-card">
          <div ref="pieChartRef" class="chart-container"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="24" class="stats-row">
      <ElCol :span="24">
        <ElCard shadow="hover" class="section-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><Position /></el-icon>
                <span>访客地理分布</span>
              </div>
            </div>
          </template>
          <VisitorMap :stats="visitorStore.stats" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="24" class="stats-row" v-if="visitorStore.stats">
      <ElCol :span="24">
        <ElCard shadow="hover" class="section-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><DataAnalysis /></el-icon>
                <span>访客统计图表</span>
              </div>
            </div>
          </template>
          <VisitorCharts :stats="visitorStore.stats" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="24" class="stats-row" v-if="statsStore.errorStats">
      <ElCol :span="24">
        <ElCard shadow="hover" class="section-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon warning"><Warning /></el-icon>
                <span>错误统计</span>
              </div>
              <ElButton type="danger" size="small" @click="statsStore.clearErrorStats" class="clear-btn">
                <el-icon><Delete /></el-icon>
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
  padding: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.chart-row {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card :deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: none;
  background: transparent;
}

.stat-card :deep(.el-card__body) {
  padding: 0 24px 24px;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 26px;
}

.card-articles .stat-icon-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-articles .stat-icon {
  color: #fff;
}

.card-views .stat-icon-wrapper {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card-views .stat-icon {
  color: #fff;
}

.card-likes .stat-icon-wrapper {
  background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
}

.card-likes .stat-icon {
  color: #fff;
}

.card-duration .stat-icon-wrapper {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.card-duration .stat-icon {
  color: #fff;
}

.card-visitors .stat-icon-wrapper {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.card-visitors .stat-icon {
  color: #fff;
}

.chart-card,
.section-card {
  border-radius: 16px;
  border: none;
  overflow: hidden;
}

.chart-card :deep(.el-card__body),
.section-card :deep(.el-card__body) {
  padding: 24px;
}

.section-card :deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.header-icon {
  font-size: 20px;
  color: #667eea;
}

.header-icon.warning {
  color: #f56c6c;
}

.clear-btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.error-stats {
  .error-total {
    margin-bottom: 20px;
    font-size: 16px;
    color: #1e293b;
    font-weight: 500;
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
    padding: 16px 20px;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-radius: 12px;
    border: 1px solid #fecaca;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      transform: translateX(4px);
    }
  }

  .error-path {
    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
    color: #667eea;
    flex: 1;
    font-weight: 500;
  }

  .error-type {
    color: #f56c6c;
    font-weight: 600;
    padding: 4px 12px;
    background: rgba(245, 108, 108, 0.1);
    border-radius: 6px;
    font-size: 13px;
  }

  .error-count {
    color: #94a3b8;
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
