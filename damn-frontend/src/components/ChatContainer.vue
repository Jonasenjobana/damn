<template>
  <div class="chat-container">
    <div class="messages-container" ref="messagesContainer">
      <MessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      >
        <template #before-content>
          <slot name="before-content" :message="msg"></slot>
        </template>
        <template #after-content>
          <slot name="after-content" :message="msg"></slot>
        </template>
      </MessageItem>

      <el-empty
        v-if="!streaming && messages.length === 0 && !disabled"
        description="发送消息开始聊天吧~"
      />

      <el-empty
        v-if="disabled"
        description="选择一个对话开始聊天"
      />
    </div>

    <div class="input-area">
      <slot name="extra-input-before"></slot>
      <el-input
        v-model="inputContent"
        type="textarea"
        :rows="3"
        placeholder="输入消息，按 Ctrl + Enter 发送..."
        :disabled="disabled || streaming"
        @keydown.enter.ctrl="handleSend"
        @keydown.enter.shift="handleNewLine"
        @keydown.enter="handleSend"
      />
      <div class="toolbar" v-if="props.toolbarItems && props.toolbarItems.length > 0">
        <div
          v-for="item in props.toolbarItems"
          :key="item.key"
          class="toolbar-item"
          @click="item.onClick"
        >
          <el-icon>
            <component :is="item.icon"></component>
          </el-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="input-actions">
        <slot name="extra-input-actions"></slot>
        <div class="spacer"></div>
        <span class="hint" v-if="!disabled">Ctrl + Enter 发送</span>
        <el-button
          v-if="streaming && enableStop"
          type="danger"
          @click="handleStop"
        >
          停止
        </el-button>
        <el-button
          v-else
          type="primary"
          @click="handleSend"
          :loading="streaming"
          :disabled="props.canSend !== undefined ? !props.canSend : (!inputContent.trim() || disabled)"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { ElEmpty } from 'element-plus'
import MessageItem from './MessageItem.vue'
import type { Message } from '@/types/llm'

interface ToolbarItem {
  key: string
  icon: any
  label: string
  onClick: () => void
}

interface Props {
  messages: Message[]
  streaming: boolean
  disabled: boolean
  canSend?: boolean
  enableStop?: boolean
  toolbarItems?: ToolbarItem[]
}


const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  disabled: false,
  canSend: undefined,
  enableStop: false,
})

const emit = defineEmits<{
  send: (content: string) => void
  stop: () => void
}>()

const inputContent = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleSend = () => {
  const content = inputContent.value.trim()
  if (!content && props.canSend !== true) return
  emit('send', content)
  inputContent.value = ''
  scrollToBottom()
}

const handleNewLine = () => {}

const handleStop = () => {
  emit('stop')
}

const setInputContent = (content: string) => {
  inputContent.value = content
}

watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  }
)

defineExpose({
  inputContent,
  setInputContent
})
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  height: 100%;
  overflow: hidden;
}

.messages-container {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 20px;
}

.input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--line-soft);
  background: var(--bg-elevated);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-actions .hint {
  font-size: 12px;
  color: var(--text-muted);
}

.toolbar {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 32px;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-soft);
}

.toolbar-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s var(--ease-smooth);
  font-size: 13px;
  color: var(--text-secondary);
}

.toolbar-item:hover {
  background: var(--bg-soft);
  color: var(--color-brand);
}

.toolbar-item .el-icon {
  font-size: 16px;
}

.input-actions .spacer {
  flex: 1;
}
</style>
