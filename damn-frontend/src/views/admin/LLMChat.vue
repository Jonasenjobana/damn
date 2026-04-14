<template>
  <div class="llm-chat-page">
    <div class="chat-layout">
      <div class="conversation-sidebar">
        <div class="sidebar-header">
          <h3>对话列表</h3>
          <el-button type="primary" size="small" @click="handleNewChat" :loading="creating">
            <el-icon><Plus /></el-icon>
            新建对话
          </el-button>
        </div>
        <div class="conversation-list">
          <div
            v-for="conv in llmStore.conversations"
            :key="conv.id"
            :class="[
              'conversation-item',
              { active: llmStore.currentConversationId === conv.id },
            ]"
            @click="selectConversation(conv.id)"
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
            <el-button
              class="delete-btn"
              type="danger"
              size="small"
              circle
              @click.stop="deleteConversation(conv.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-empty v-if="llmStore.conversations.length === 0" description="暂无对话" />
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header" v-if="llmStore.currentConversation">
          <div class="header-info">
            <span class="conv-title">{{ llmStore.currentConversation.title }}</span>
            <el-tag size="small">{{ llmStore.currentConversation.modelName }}</el-tag>
            <el-tag size="small" :type="llmStore.currentConversation.conversationType === 'chat' ? 'info' : 'warning'">
              {{ llmStore.currentConversation.conversationType === 'chat' ? '聊天' : '账单' }}
            </el-tag>
          </div>
          <el-button
            v-if="llmStore.currentConversation"
            type="primary"
            link
            @click="editTitle"
          >
            编辑标题
          </el-button>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="msg in llmStore.messages"
            :key="msg.id"
            :class="['message-item', `role-${msg.role}`]"
          >
            <div class="message-avatar">
              <el-icon v-if="msg.role === 'user'"><User /></el-icon>
              <el-icon v-else><MagicStick /></el-icon>
            </div>
            <div class="message-content">
              <template v-for="part in parseThinkBlocks(msg.content)">
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

              <div v-if="billsByMessage[msg.id]" class="bills-container">
                <BillCard
                  v-for="bill in billsByMessage[msg.id]"
                  :key="bill.id"
                  :bill="bill"
                  @delete="handleDeleteBill"
                />
              </div>
            </div>
          </div>



          <el-empty
            v-if="!streaming && llmStore.messages.length === 0 && llmStore.currentConversation"
            description="发送消息开始聊天吧~"
          />

          <el-empty
            v-if="!llmStore.currentConversation"
            description="选择一个对话或新建对话开始聊天"
          />
        </div>

        <div class="input-area" v-if="llmStore.currentConversation">
          <div v-if="currentConversationType === 'bill'" class="upload-area">
            <div class="upload-row">
              <div class="image-upload">
                <el-upload
                v-model:file-list="imageFileList"
                action="/api/upload/image"
                :show-file-list="false"
                :on-success="handleImageUploadSuccess"
                :before-upload="beforeImageUpload"
                list-type="picture-card"
                accept="image/*"
              >
                  <el-icon><Plus /></el-icon>
                  <div class="el-upload__tip">点击上传账单截图</div>
                </el-upload>
                <div v-if="uploadedImageUrl" class="uploaded-image">
                  <img :src="uploadedImageUrl" alt="账单截图" />
                </div>
              </div>
              <div class="json-upload">
                <el-upload
                v-model:file-list="jsonFileList"
                action="/api/llm/conversations/{{ llmStore.currentConversationId }}/bills/upload"
                :show-file-list="false"
                :on-success="handleJsonUploadSuccess"
                :before-upload="beforeJsonUpload"
                accept=".json"
              >
                  <el-button type="success" size="small">
                    <el-icon><UploadFilled /></el-icon>
                    导入JSON
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
          <el-input
            v-model="inputContent"
            type="textarea"
            :rows="3"
            placeholder="输入消息，按 Ctrl + Enter 发送..."
            :disabled="streaming"
            @keydown.enter.ctrl="handleSend"
            @keydown.enter.shift="handleNewLine"
            @keydown.enter="handleSend"
          />
          <div class="input-actions">
            <span class="hint">Ctrl + Enter 发送</span>
            <el-button
              type="primary"
              @click="handleSend"
              :loading="streaming"
              :disabled="!inputContent.trim() || !llmStore.currentConversation"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="titleDialogVisible" title="编辑标题" width="400px">
      <el-input v-model="editingTitle" placeholder="输入对话标题" />
      <template #footer>
        <el-button @click="titleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTitle">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="newChatDialogVisible" title="选择对话类型" width="400px">
      <div class="dialog-content">
        <el-radio-group v-model="selectedType" size="large">
          <el-radio value="chat">
            <div class="type-item">
              <div class="type-title">💬 普通聊天</div>
              <div class="type-desc">自由对话问答，流式响应</div>
            </div>
          </el-radio>
          <el-radio value="bill">
            <div class="type-item">
              <div class="type-title">🧾 账单识别</div>
              <div class="type-desc">上传账单截图，AI 自动识别结构化存储</div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="newChatDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmNewChat">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { Plus, Delete, User, MagicStick, UploadFilled } from '@element-plus/icons-vue';
import { useLLMStore } from '@/stores/modules/llm';
import { llmAPI } from '@/api/modules/llm';
import type { Message, StreamChunk, Bill } from '@/types/llm';
import { marked } from 'marked';
import { ElMessage } from 'element-plus';
import BillCard from '@/components/BillCard.vue';
import ThinkBlock from '@/components/ThinkBlock.vue';

interface ContentPart {
  content: string;
  isThink: boolean;
}

const parseThinkBlocks = (content: string): ContentPart[] => {
  if (!content) return [{ content: '', isThink: false }];

  const result: ContentPart[] = [];
  let remaining = content;
  let thinkStartIndex = remaining.indexOf('<think>');

  if (thinkStartIndex === -1) {
    const trimmed = content.trim();
    return trimmed ? [{ content: trimmed, isThink: false }] : [];
  }

  while (remaining.length > 0) {
    thinkStartIndex = remaining.indexOf('<think>');
    if (thinkStartIndex === -1) {
      const trimmed = remaining.trim();
      if (trimmed) {
        result.push({ content: trimmed, isThink: false });
      }
      break;
    }

    if (thinkStartIndex > 0) {
      const before = remaining.slice(0, thinkStartIndex).trim();
      if (before) {
        result.push({ content: before, isThink: false });
      }
    }

    remaining = remaining.slice(thinkStartIndex + '<think>'.length);

    const thinkEndIndex = remaining.indexOf('</think>');
    if (thinkEndIndex === -1) {
      const thinkContent = remaining.trim();
      if (thinkContent) {
        result.push({ content: thinkContent, isThink: true });
      }
      break;
    }

    const thinkContent = remaining.slice(0, thinkEndIndex).trim();
    if (thinkContent) {
      result.push({ content: thinkContent, isThink: true });
    }
    remaining = remaining.slice(thinkEndIndex + '</think>'.length);
  }

  return result.length > 0 ? result : [{ content, isThink: false }];
};

const llmStore = useLLMStore();
const messagesContainer = ref<HTMLElement | null>(null);
const inputContent = ref('');
const streaming = ref(false);
const currentStreamingContent = ref('');
const creating = ref(false);
const titleDialogVisible = ref(false);
const editingTitle = ref('');
const newChatDialogVisible = ref(false);
const selectedType = ref<'chat' | 'bill'>('chat');
const imageFileList = ref([]);
const uploadedImageUrl = ref('');
const jsonFileList = ref([]);

const currentConversationType = computed(() => {
  return llmStore.currentConversation?.conversationType || 'chat';
});

const billsByMessage = ref<Record<number, Bill[]>>({});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const renderMarkdown = (content: string) => {
  if (!content) return '';
  return marked.parse(content);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const loadBills = async () => {
  if (!llmStore.currentConversationId) return;
  const bills = await llmStore.getBills(llmStore.currentConversationId);
  const grouped: Record<number, Bill[]> = {};
  for (const bill of bills) {
    if (!grouped[bill.messageId]) {
      grouped[bill.messageId] = [];
    }
    grouped[bill.messageId]?.push(bill);
  }
  billsByMessage.value = grouped;
};

const handleNewChat = () => {
  newChatDialogVisible.value = true;
};

const confirmNewChat = async () => {
  creating.value = true;
  await llmStore.createConversation(undefined, selectedType.value);
  creating.value = false;
  newChatDialogVisible.value = false;
  scrollToBottom();
  await loadBills();
};

const selectConversation = async (id: number) => {
  await llmStore.switchConversation(id);
  scrollToBottom();
  await loadBills();
};

const deleteConversation = async (id: number) => {
  await llmStore.deleteConversation(id);
  await loadBills();
};

const editTitle = () => {
  if (!llmStore.currentConversation) return;
  editingTitle.value = llmStore.currentConversation.title;
  titleDialogVisible.value = true;
};

const saveTitle = async () => {
  if (!llmStore.currentConversationId) return;
  await llmStore.updateTitle(llmStore.currentConversationId, editingTitle.value);
  titleDialogVisible.value = false;
};

const handleNewLine = () => {
};

const beforeImageUpload = (file: any) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleImageUploadSuccess = (response: any) => {
  if (response.rlt === '0') {
    uploadedImageUrl.value = response.data.url;
    const imageMarkdown = `![账单截图](${response.data.url})`;
    inputContent.value = inputContent.value ? `${inputContent.value}\n\n${imageMarkdown}` : imageMarkdown;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error('上传失败');
  }
};

const beforeJsonUpload = (file: any) => {
  const isJson = file.type === 'application/json' || file.name.endsWith('.json');
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isJson) {
    ElMessage.error('只能上传 JSON 文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!');
    return false;
  }
  return true;
};

const handleJsonUploadSuccess = (response: any) => {
  jsonFileList.value = [];
  if (response.rlt === '0') {
    ElMessage.success(response.msg || `导入成功，共导入 ${response.data.count} 条账单`);
    loadBills();
  } else {
    ElMessage.error('导入失败: ' + response.msg);
  }
};

const handleDeleteBill = (id: number) => {
  llmStore.deleteBill(id);
  loadBills();
};

const handleSend = () => {
  if (!llmStore.currentConversation) {
    ElMessage.warning('请先选择对话');
    return;
  }
  const content = inputContent.value.trim();
  if (!content) {
    return;
  }

  const conversationId = llmStore.currentConversation.id!;
  const userMessage: Message = {
    id: Date.now(),
    conversationId,
    role: 'user',
    content,
    createTime: new Date().toISOString(),
  };
  llmStore.addMessage(userMessage);
  inputContent.value = '';
  uploadedImageUrl.value = '';
  imageFileList.value = [];
  streaming.value = true;
  currentStreamingContent.value = '';

  const assistantMessage: Message = {
    id: Date.now() + 1,
    conversationId,
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString(),
  };
  llmStore.addMessage(assistantMessage);
  scrollToBottom();

  llmAPI.chat(
    conversationId,
    content,
    (chunk: StreamChunk) => {
      if (chunk.error) {
        ElMessage.error(chunk.error);
        streaming.value = false;
        return;
      }
      if (chunk.chunk) {
        currentStreamingContent.value += chunk.chunk;
        llmStore.appendToLastMessage(chunk.chunk);
        scrollToBottom();
      }
      if (chunk.done) {
        streaming.value = false;
        currentStreamingContent.value = '';
        if (currentConversationType.value === 'bill') {
          loadBills();
        }
        if (llmStore.conversations[0]?.id === conversationId) {
          const firstLine = content.split('\n')[0];
          if (firstLine) {
            let title = firstLine.slice(0, 30);
            if (firstLine.length > 30) title += '...';
            llmStore.updateTitle(conversationId, title);
          }
        }
      }
    },
    (error: Error) => {
      ElMessage.error('聊天失败: ' + error.message);
      streaming.value = false;
    },
    () => {
      streaming.value = false;
      currentStreamingContent.value = '';
    },
  );
};

watch(() => llmStore.currentConversationId, async () => {
  await loadBills();
});

onMounted(() => {
  llmStore.loadConversations();
});
</script>

<style scoped>
.llm-chat-page {
  height: calc(100vh - 120px);
  background: var(--bg-elevated);
  border-radius: 12px;
  overflow: hidden;
}

.chat-layout {
  display: flex;
  height: 100%;
}

.conversation-sidebar {
  width: 280px;
  border-right: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  background: var(--bg-soft);
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
  padding-right: 30px;
}

.conversation-item .delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info .conv-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

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

.bills-container {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.streaming-content {
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-soft);
  line-height: 1.6;
  color: var(--text-primary);
  display: inline-block;
}

.cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--text-muted);
}

.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

.input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--line-soft);
  background: var(--bg-elevated);
}

.upload-area {
  margin-bottom: 12px;
}

.upload-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.image-upload {
  flex: 1;
  max-width: 300px;
}

.json-upload {
  padding-top: 4px;
}

.uploaded-image {
  margin-top: 12px;
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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

.dialog-content {
  padding: 12px 0;
}

.type-item {
  padding: 12px;
}

.type-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.type-desc {
  font-size: 13px;
  color: var(--text-muted);
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
  color: #abb2bf;
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
