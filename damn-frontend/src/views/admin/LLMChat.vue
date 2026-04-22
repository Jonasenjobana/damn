<template>
  <div class="llm-chat-page">
    <div class="chat-layout">
      <ConversationList
        :conversations="conversations"
        :current-id="currentConversationId"
        :creating="creating"
        @select="selectConversation"
        @delete="deleteConversation"
        @new="handleNewChat" />

      <div class="chat-main">
        <div class="chat-header" v-if="currentConversation">
          <div class="header-info">
            <span class="conv-title">{{ currentConversation.title }}</span>
            <el-tag size="small">{{ currentConversation.modelName }}</el-tag>
            <el-tag size="small" :type="currentConversation.conversationType === 'chat' ? 'info' : 'warning'">
              {{ currentConversation.conversationType === "chat" ? "聊天" : "账单" }}
            </el-tag>
          </div>
          <el-button type="primary" link @click="editTitle"> 编辑标题 </el-button>
        </div>

        <ChatContainer
          ref="chatContainerRef"
          :messages="messages"
          :streaming="streaming"
          :disabled="!currentConversation"
          :can-send="canSend"
          :enable-stop="true"
          :toolbar-items="toolbarItems"
          @send="handleSend"
          @stop="stopGeneration"
        >
          <template #extra-input-before>
            <div v-if="currentConversationType === 'bill'" class="upload-section">
              <div v-if="uploadedImageUrl" class="preview-wrapper">
                <div class="uploaded-image">
                  <img :src="uploadedImageUrl" alt="账单截图" />
                </div>
              </div>
              <el-upload
                v-model:file-list="imageFileList"
                action="/api/upload/image"
                :show-file-list="false"
                :on-success="handleImageUploadSuccess"
                :before-upload="beforeImageUpload"
                list-type="picture-card"
                accept="image/*"
                style="display: none;"
              >
                <template #trigger>
                  <input ref="imageUploadRef" type="file" accept="image/*" hidden />
                </template>
              </el-upload>
              <el-upload
                v-model:file-list="jsonFileList"
                action="/api/llm/conversations/{{ currentConversationId }}/bills/upload"
                :show-file-list="false"
                :on-success="handleJsonUploadSuccess"
                :before-upload="beforeJsonUpload"
                accept=".json"
                style="display: none;"
              >
                <template #trigger>
                  <input ref="jsonUploadRef" type="file" accept=".json" hidden />
                </template>
              </el-upload>
            </div>
          </template>

          <template #after-content="{ message }">
            <div v-if="billsByMessage[message.id]" class="bills-container">
              <BillCard v-for="bill in billsByMessage[message.id]" :key="bill.id" :bill="bill" @delete="handleDeleteBill" />
            </div>
            <div v-if="message.id === messages[messages.length - 1]?.id && canRetry" class="retry-area">
              <el-button type="primary" size="small" plain @click="retryLastMessage">
                <el-icon><RefreshRight /></el-icon>
                重新发送
              </el-button>
            </div>
          </template>
        </ChatContainer>
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
import { ref, computed, onMounted, watch } from "vue";
import { Plus, UploadFilled, RefreshRight } from "@element-plus/icons-vue";
import { ElMessage, ElUpload } from "element-plus";
import { useLLMChat } from "@/composables/useLLMChat";
import { useLLMStore } from "@/stores/modules/llm";
import type { Bill } from "@/types/llm";
import ConversationList from "@/components/ConversationList.vue";
import ChatContainer from "@/components/ChatContainer.vue";
import BillCard from "@/components/BillCard.vue";

const llmStore = useLLMStore();
const {
  conversations,
  currentConversationId,
  currentConversation,
  messages,
  streaming,
  sendMessage,
  createNewConversation,
  selectConversation,
  deleteConversation,
  loadConversations,
  stopGeneration,
  retryLastMessage,
  canRetry,
} = useLLMChat({
  onMessageComplete: () => {
    loadBills();
  },
});

const creating = ref(false);
const titleDialogVisible = ref(false);
const editingTitle = ref("");
const newChatDialogVisible = ref(false);
const selectedType = ref<"chat" | "bill">("chat");
const imageFileList = ref([]);
const uploadedImageUrl = ref("");
const jsonFileList = ref([]);
const billsByMessage = ref<Record<number, Bill[]>>({});
const chatContainerRef = ref<{ inputContent: string; setInputContent: (content: string) => void } | null>(null);

const currentConversationType = computed(() => {
  return currentConversation.value?.conversationType || "chat";
});

const canSend = computed(() => {
  if (uploadedImageUrl.value) return true
  return false
})


const imageUploadRef = ref<HTMLInputElement | null>(null)
const jsonUploadRef = ref<HTMLInputElement | null>(null)

const toolbarItems = computed(() => {
  const items: any[] = []
  if (currentConversationType.value === 'bill') {
    items.push({
      key: 'upload-image',
      icon: Plus,
      label: '上传图片',
      onClick: () => {
        imageUploadRef.value?.click()
      }
    })
    items.push({
      key: 'upload-json',
      icon: UploadFilled,
      label: '导入JSON',
      onClick: () => {
        jsonUploadRef.value?.click()
      }
    })
  }
  return items
});

const loadBills = async () => {
  if (!currentConversationId.value) return;
  const bills = await llmStore.getBills(currentConversationId.value);
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
  await createNewConversation(undefined, selectedType.value);
  creating.value = false;
  newChatDialogVisible.value = false;
  await loadBills();
};

const handleSend = (content: string) => {
  sendMessage(content);
  uploadedImageUrl.value = "";
  imageFileList.value = [];
};

const editTitle = () => {
  if (!currentConversation.value) return;
  editingTitle.value = currentConversation.value.title;
  titleDialogVisible.value = true;
};

const saveTitle = async () => {
  if (!currentConversationId.value) return;
  await llmStore.updateTitle(currentConversationId.value, editingTitle.value);
  titleDialogVisible.value = false;
};

const handleDeleteBill = async (id: number) => {
  await llmStore.deleteBill(id);
  await loadBills();
};

const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

const handleImageUploadSuccess = (response: any) => {
  if (response.rlt === "0") {
    uploadedImageUrl.value = response.data.url;
    const imageMarkdown = `![账单截图](${response.data.url})`;
    const currentContent = chatContainerRef.value?.inputContent || '';
    chatContainerRef.value?.setInputContent(currentContent + `\n\n${imageMarkdown}`);
    ElMessage.success("上传成功");
  } else {
    ElMessage.error("上传失败");
  }
};

const beforeJsonUpload = (file: File) => {
  const isJson = file.type === "application/json" || file.name.endsWith(".json");
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isJson) {
    ElMessage.error("只能上传 JSON 文件!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("文件大小不能超过 5MB!");
    return false;
  }
  return true;
};

const handleJsonUploadSuccess = (response: any) => {
  jsonFileList.value = [];
  if (response.rlt === "0") {
    ElMessage.success(response.msg || `导入成功，共导入 ${response.data.count} 条账单`);
    loadBills();
  } else {
    ElMessage.error("导入失败: " + response.msg);
  }
};

watch(currentConversationId, async () => {
  await loadBills();
});

onMounted(() => {
  loadConversations();
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

.bills-container {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-area {
  margin-bottom: 12px;
}

.upload-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-height: 220px;
  overflow: hidden;
}

.image-upload {
  width: 200px;
  flex-shrink: 0;
}

.json-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
  .upload-section {
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 12px;
    background: var(--bg-soft);
  }
}
.preview-wrapper {
  margin-bottom: 0;
}

.uploaded-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-base);
}

.uploaded-image img {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  display: block;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-buttons .el-button {
  border-radius: 8px;
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

.retry-area {
  margin-top: 8px;
  text-align: left;
}
</style>
