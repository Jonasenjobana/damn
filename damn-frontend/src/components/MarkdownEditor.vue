<template>
  <div class="markdown-editor">
    <div class="toolbar">
      <div class="toolbar-left">
        <button type="button" class="toolbar-btn" @click="insertHeading" title="标题">H</button>
        <button type="button" class="toolbar-btn" @click="insertBold" title="粗体">B</button>
        <button type="button" class="toolbar-btn" @click="insertItalic" title="斜体">I</button>
        <span class="toolbar-divider"></span>
        <button type="button" class="toolbar-btn" @click="insertLink" title="链接">🔗</button>
        <button type="button" class="toolbar-btn" @click="triggerImageUpload" title="上传图片">📷</button>
        <button type="button" class="toolbar-btn" @click="insertCode" title="代码">`</button>
        <button type="button" class="toolbar-btn" @click="insertQuote" title="引用">"</button>
        <span class="toolbar-divider"></span>
        <button type="button" class="toolbar-btn" @click="insertUl" title="无序列表">•</button>
        <button type="button" class="toolbar-btn" @click="insertOl" title="有序列表">1.</button>
      </div>
      <div class="toolbar-right">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          accept="image/*"
          style="display: none"
        />
        <span class="upload-hint">
          <small>💡 Ctrl+V 粘贴图片</small>
        </span>
      </div>
    </div>
    
    <div ref="editorRef" class="editor-content"></div>
    
    <div v-if="uploading" class="upload-overlay">
      <div class="upload-spinner">
        <span>⏳ 上传中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Editor from '@toast-ui/editor'
import { uploadAPI } from '@/api/modules/upload'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: '400px',
})

const emit = defineEmits<Emits>()

const editorRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

let editor: Editor | null = null

const initEditor = () => {
  if (!editorRef.value) return

  editor = new Editor({
    el: editorRef.value,
    height: props.height,
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    initialValue: props.modelValue || '',
    placeholder: props.placeholder,
    usageStatistics: false,
    hooks: {
      addImageBlobHook: async (blob: Blob, callback: (url: string, altText: string) => void) => {
        try {
          uploading.value = true
          console.log('[MarkdownEditor] 正在上传图片...')
          
          const file = new File([blob], `image_${Date.now()}.png`, { type: blob.type })
          const response = await uploadAPI.uploadImage(file)
          
          if (response.rlt === '0' && response.data?.url) {
            const imageUrl = response.data.url
            console.log('[MarkdownEditor] 图片上传成功:', imageUrl)
            callback(imageUrl, 'image')
          } else {
            ElMessage.error(response.msg || '图片上传失败')
          }
        } catch (error: any) {
          console.error('[MarkdownEditor] 图片上传失败:', error)
          ElMessage.error(error.message || '图片上传失败')
        } finally {
          uploading.value = false
        }
      },
    },
  })

  editor.on('change', () => {
    const content = editor?.getMarkdown() || ''
    emit('update:modelValue', content)
  })

  editorRef.value.addEventListener('paste', handlePaste)
}

const handlePaste = async (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      e.stopPropagation()

      const blob = item.getAsFile()
      if (!blob) continue

      try {
        uploading.value = true
        console.log('[MarkdownEditor] 检测到粘贴图片，正在上传...')
        
        const file = new File([blob], `pasted_image_${Date.now()}.png`, { type: blob.type })
        const response = await uploadAPI.uploadImage(file)
        
        if (response.rlt === '0' && response.data?.url) {
          const imageUrl = response.data.url
          const markdownImage = `![pasted-image](${imageUrl})`
          
          editor?.insertText(markdownImage)
          console.log('[MarkdownEditor] 粘贴图片成功:', imageUrl)
        } else {
          ElMessage.error(response.msg || '图片上传失败')
        }
      } catch (error: any) {
        console.error('[MarkdownEditor] 粘贴图片失败:', error)
        ElMessage.error(error.message || '图片上传失败')
      } finally {
        uploading.value = false
      }
      break
    }
  }
}

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }

  try {
    uploading.value = true
    console.log('[MarkdownEditor] 正在上传图片...')
    
    const response = await uploadAPI.uploadImage(file)
    
    if (response.rlt === '0' && response.data?.url) {
      const imageUrl = response.data.url
      const markdownImage = `![${file.name}](${imageUrl})`
      
      editor?.insertText(markdownImage)
      console.log('[MarkdownEditor] 图片上传成功:', imageUrl)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(response.msg || '图片上传失败')
    }
  } catch (error: any) {
    console.error('[MarkdownEditor] 图片上传失败:', error)
    ElMessage.error(error.message || '图片上传失败')
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const insertHeading = () => {
  editor?.exec('heading', { level: 2 })
}

const insertBold = () => {
  editor?.exec('bold')
}

const insertItalic = () => {
  editor?.exec('italic')
}

const insertLink = () => {
  const selection = editor?.getSelection()
  const selectedText = selection?.toString() || '链接文字'
  editor?.replaceSelection(`[${selectedText}](url)`)
}

const insertCode = () => {
  editor?.exec('code')
}

const insertQuote = () => {
  editor?.exec('quote')
}

const insertUl = () => {
  editor?.exec('bulletList')
}

const insertOl = () => {
  editor?.exec('orderedList')
}

watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getMarkdown()) {
    editor.setMarkdown(newValue || '')
  }
})

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.removeEventListener('paste', handlePaste)
  }
  editor?.destroy()
})

defineExpose({
  getMarkdown: () => editor?.getMarkdown() || '',
  setMarkdown: (content: string) => editor?.setMarkdown(content),
  focus: () => editor?.focus(),
})
</script>

<style scoped>
.markdown-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dcdfe6;
  margin: 0 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.upload-hint {
  color: #909399;
  font-size: 12px;
}

.editor-content {
  background: #fff;
}

:deep(.toastui-editor-defaultUI) {
  border: none;
}

:deep(.toastui-editor-toolbar) {
  display: none;
}

:deep(.toastui-editor-contents) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.toastui-editor-md-splitter) {
  border-color: #e4e7ed;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.upload-spinner {
  padding: 20px 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  color: #409eff;
}
</style>
