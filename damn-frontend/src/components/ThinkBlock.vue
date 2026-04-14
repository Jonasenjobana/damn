<template>
  <div class="think-block">
    <div class="think-header" @click="toggle">
      <div class="think-title">
        <el-icon><MagicStick /></el-icon>
        <span>深度思考 ({{ content.length }} 字符)</span>
      </div>
      <el-icon :class="{ rotated: expanded }">
        <ArrowDown />
      </el-icon>
    </div>
    <transition name="think-collapse">
      <div v-show="expanded" class="think-content">
        <div v-html="renderMarkdown(content)" class="think-markdown"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MagicStick, ArrowDown } from '@element-plus/icons-vue'
import { marked } from 'marked'

interface Props {
  content: string
}

const props = withDefaults(defineProps<Props>(), {})
const expanded = ref(true)

const toggle = () => {
  expanded.value = !expanded.value
}

const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked.parse(content)
}
</script>

<style scoped>
.think-block {
  margin: 12px 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--color-brand) 5%, var(--bg-elevated));
  overflow: hidden;
}

.think-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s var(--ease-smooth);
}

.think-header:hover {
  background: color-mix(in srgb, var(--color-brand) 8%, var(--bg-elevated));
}

.think-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-brand);
}

.think-header .el-icon:last-child {
  transition: transform 0.3s var(--ease-smooth);
  color: var(--text-muted);
}

.think-header .el-icon:last-child.rotated {
  transform: rotate(180deg);
}

.think-content {
  border-top: 1px solid var(--line-soft);
  max-height: 500px;
  overflow-y: auto;
}

.think-markdown {
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.think-collapse-enter-active,
.think-collapse-leave-active {
  transition: all 0.3s var(--ease-smooth);
}

.think-collapse-enter-from,
.think-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.think-collapse-enter-to,
.think-collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

:deep(.think-markdown p) {
  margin: 8px 0;
}

:deep(.think-markdown pre) {
  background: var(--bg-soft);
  padding: 8px 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

:deep(.think-markdown code) {
  background: var(--bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(.think-markdown ul),
:deep(.think-markdown ol) {
  padding-left: 20px;
  margin: 8px 0;
}
</style>
