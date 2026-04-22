<template>
  <div :class="['message-item', `role-${message.role}`]">
    <div class="message-avatar">
      <el-icon v-if="message.role === 'user'"><User /></el-icon>
      <el-icon v-else><MagicStick /></el-icon>
    </div>
    <div class="message-content">
      <template v-for="part in parsedContent">
        <ThinkBlock
          v-if="part.isThink"
          :content="part.content"
        />
        <div
          v-else
          v-html="renderMarkdown(part.content)"
          class="markdown-body"
        ></div>
      </template>

      <slot name="before-content"></slot>
      <slot name="after-content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, MagicStick } from '@element-plus/icons-vue'
import { marked } from 'marked'
import ThinkBlock from './ThinkBlock.vue'
import type { Message } from '@/types/llm'

interface ContentPart {
  content: string
  isThink: boolean
}

interface Props {
  message: Message
}

const props = withDefaults(defineProps<Props>(), {})

const parseThinkBlocks = (content: string): ContentPart[] => {
  if (!content) return [{ content: '', isThink: false }]

  const result: ContentPart[] = []
  let remaining = content
  let thinkStartIndex = remaining.indexOf('<think>')

  if (thinkStartIndex === -1) {
    const trimmed = content.trim()
    return trimmed ? [{ content: trimmed, isThink: false }] : []
  }

  while (remaining.length > 0) {
    thinkStartIndex = remaining.indexOf('<think>')
    if (thinkStartIndex === -1) {
      const trimmed = remaining.trim()
      if (trimmed) {
        result.push({ content: trimmed, isThink: false })
      }
      break
    }

    if (thinkStartIndex > 0) {
      const before = remaining.slice(0, thinkStartIndex).trim()
      if (before) {
        result.push({ content: before, isThink: false })
      }
    }

    remaining = remaining.slice(thinkStartIndex + '<think>'.length)

    const thinkEndIndex = remaining.indexOf('</think>')
    if (thinkEndIndex === -1) {
      const thinkContent = remaining.trim()
      if (thinkContent) {
        result.push({ content: thinkContent, isThink: true })
      }
      break
    }

    const thinkContent = remaining.slice(0, thinkEndIndex).trim()
    if (thinkContent) {
      result.push({ content: thinkContent, isThink: true })
    }
    remaining = remaining.slice(thinkEndIndex + '</think>'.length)
  }

  return result.length > 0 ? result : [{ content, isThink: false }]
}

const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked.parse(content)
}

const parsedContent = computed(() => parseThinkBlocks(props.message.content))
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.role-user {
  flex-direction: row-reverse;
}

.message-item.role-user .message-content {
  align-items: flex-end;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.role-user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message-item.role-assistant .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.message-avatar .el-icon {
  font-size: 20px;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 60px);
}

.message-item.role-user .message-content {
  display: flex;
  justify-content: flex-end;
}

.markdown-body {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
}

.message-item.role-user .markdown-body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: inline-block;
}

.message-item.role-assistant .markdown-body {
  background: var(--bg-soft);
  color: var(--text-primary);
}

:deep(.markdown-body h1) {
  font-size: 24px;
  margin: 16px 0 12px;
}

:deep(.markdown-body h2) {
  font-size: 20px;
  margin: 14px 0 10px;
}

:deep(.markdown-body h3) {
  font-size: 18px;
  margin: 12px 0 8px;
}

:deep(.markdown-body p) {
  margin: 8px 0;
}

:deep(.markdown-body code) {
  background: color-mix(in srgb, var(--text-primary) 10%, transparent);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

:deep(.markdown-body pre) {
  background: var(--bg-elevated);
  border: 1px solid var(--line-soft);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid var(--line-strong);
  padding-left: 12px;
  color: var(--text-secondary);
  margin: 12px 0;
}

:deep(.markdown-body img) {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  background: transparent;
}
</style>
