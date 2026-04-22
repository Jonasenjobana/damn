<template>
  <div class="conversation-sidebar">
    <div class="sidebar-header">
      <h3>对话列表</h3>
      <el-button type="primary" size="small" @click="$emit('new')" :loading="creating">
        <el-icon><Plus /></el-icon>
        新建对话
      </el-button>
    </div>
    <div class="conversation-list">
      <el-popover
        v-for="conv in conversations"
        :key="conv.id"
        ref="popoverRef"
        placement="right"
        :title="conv.title"
        trigger="contextmenu"
        @contextmenu.prevent="() => {}"
      >
        <template #default>
          <div class="context-menu">
            <div class="menu-item delete-item" @click="handleDelete(conv.id, conv.title)">
              <el-icon><Delete /></el-icon>
              <span>删除对话</span>
            </div>
          </div>
        </template>
        <template #reference>
          <div
            :class="[
              'conversation-item',
              { active: currentId === conv.id },
            ]"
            @click="$emit('select', conv.id)"
          >
            <div class="conv-info">
              <div class="conv-title">{{ conv.title }}</div>
              <div class="conv-type">
                <el-tag size="small" :type="conv.conversationType === 'chat' ? 'info' : 'warning'">
                  {{ conv.conversationType === 'chat' ? '聊天' : '账单' }}
                </el-tag>
              </div>
            </div>
            <div class="conv-date">{{ formatDate(conv.updateTime) }}</div>
          </div>
        </template>
      </el-popover>
      <el-empty v-if="conversations.length === 0" description="暂无对话" />
    </div>
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除对话 "{{ deletingTitle }}" 吗？此操作不可恢复。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { Conversation } from '@/types/llm'

interface Props {
  conversations: Conversation[]
  currentId: number | null
  creating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  creating: false,
})

const emit = defineEmits<{
  select: [id: number]
  delete: [id: number]
  new: []
}>()

const deleteDialogVisible = ref(false)
const deletingId = ref<number | null>(null)
const deletingTitle = ref('')

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const handleDelete = (id: number, title: string) => {
  deletingId.value = id
  deletingTitle.value = title
  deleteDialogVisible.value = true
}

const confirmDelete = () => {
  if (deletingId.value !== null) {
    emit('delete', deletingId.value)
  }
  deleteDialogVisible.value = false
  deletingId.value = null
  deletingTitle.value = ''
}
</script>

<style scoped>
.conversation-sidebar {
  width: 280px;
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  background: var(--bg-soft);
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-elevated);
  border: 1px solid transparent;
  position: relative;
}

.conversation-item:hover {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, transparent);
}

.conversation-item.active {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, transparent);
}

.conversation-item .conv-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.conversation-item .conv-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item .conv-date {
  font-size: 12px;
  color: var(--text-muted);
}

.context-menu {
  min-width: 120px;
}

.context-menu .menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  color: var(--text-primary);
  font-size: 14px;
}

.context-menu .menu-item:hover {
  background: var(--bg-soft);
}

.context-menu .delete-item:hover {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
}
</style>
