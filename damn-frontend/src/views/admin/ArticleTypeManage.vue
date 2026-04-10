<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useArticleTypeStore } from '@/stores/modules/articleType'
import type { ArticleType, CreateArticleTypeDTO, UpdateArticleTypeDTO } from '@/types/articleType'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElMessage,
  ElMessageBox,
  ElCard,
} from 'element-plus'

const articleTypeStore = useArticleTypeStore()

const dialogVisible = ref(false)
const dialogTitle = ref('创建类型')
const currentType = ref<ArticleType | null>(null)

const formData = ref<CreateArticleTypeDTO & UpdateArticleTypeDTO>({
  name: '',
  sort: 0,
  status: 1,
})

function openCreateDialog() {
  dialogTitle.value = '创建类型'
  currentType.value = null
  formData.value = {
    name: '',
    sort: 0,
    status: 1,
  }
  dialogVisible.value = true
}

function openEditDialog(type: ArticleType) {
  dialogTitle.value = '编辑类型'
  currentType.value = type
  formData.value = {
    name: type.name,
    sort: type.sort,
    status: type.status,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formData.value.name) {
    ElMessage.warning('请输入类型名称')
    return
  }

  try {
    if (currentType.value) {
      await articleTypeStore.updateType(currentType.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await articleTypeStore.createType(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await articleTypeStore.fetchTypes()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(type: ArticleType) {
  try {
    await ElMessageBox.confirm(`确定要删除类型"${type.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await articleTypeStore.deleteType(type.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function getStatusText(status: number) {
  return status === 1 ? '启用' : '禁用'
}

function getStatusType(status: number) {
  return status === 1 ? 'success' : 'info'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await articleTypeStore.fetchTypes()
})
</script>

<template>
  <div class="article-type-manage-container">
    <ElCard shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章类型管理</span>
          <ElButton type="primary" @click="openCreateDialog">创建类型</ElButton>
        </div>
      </template>

      <ElTable :data="articleTypeStore.types" v-loading="articleTypeStore.loading" stripe>
        <ElTableColumn prop="name" label="名称" min-width="200" />
        <ElTableColumn prop="sort" label="排序" width="120" align="center" />
        <ElTableColumn prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElButton size="small" type="primary" @click="openEditDialog(row)">编辑</ElButton>
            <ElButton size="small" type="danger" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm :model="formData" label-width="100px">
        <ElFormItem label="名称" required>
          <ElInput v-model="formData.name" placeholder="请输入类型名称" />
        </ElFormItem>

        <ElFormItem label="排序">
          <ElInput
            v-model.number="formData.sort"
            type="number"
            placeholder="数值越大越靠前"
          />
        </ElFormItem>

        <ElFormItem label="状态" v-if="currentType">
          <ElSwitch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.article-type-manage-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
