import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { llmAPI } from '@/api/modules/llm';
import type { Conversation, Message, Bill } from '@/types/llm';
import { ElMessage } from 'element-plus';

export const useLLMStore = defineStore('llm', () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversationId = ref<number | null>(null);
  const messages = ref<Message[]>([]);
  const loading = ref(false);

  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null;
    return conversations.value.find(c => c.id === currentConversationId.value) || null;
  });

  const loadConversations = async () => {
    try {
      const response = await llmAPI.getConversations();
      if (response.rlt === '0') {
        conversations.value = response.data || [];
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      ElMessage.error('加载对话列表失败');
    }
  };

  const createConversation = async (modelName?: string, conversationType?: 'chat' | 'bill'): Promise<Conversation | null> => {
    try {
      const response = await llmAPI.createConversation(modelName, conversationType);
      if (response.rlt === '0') {
        conversations.value.unshift(response.data);
        currentConversationId.value = response.data.id;
        messages.value = [];
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      ElMessage.error('创建对话失败');
    }
    return null;
  };

  const deleteConversation = async (id: number) => {
    try {
      const response = await llmAPI.deleteConversation(id);
      if (response.rlt === '0') {
        conversations.value = conversations.value.filter(c => c.id !== id);
        if (currentConversationId.value === id) {
          currentConversationId.value = conversations.value[0]?.id || null;
          if (currentConversationId.value) {
            await loadMessages(currentConversationId.value);
          } else {
            messages.value = [];
          }
        }
        ElMessage.success('删除成功');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      ElMessage.error('删除失败');
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      currentConversationId.value = conversationId;
      const response = await llmAPI.getMessages(conversationId);
      if (response.rlt === '0') {
        messages.value = response.data || [];
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      ElMessage.error('加载消息失败');
    }
  };

  const updateTitle = async (id: number, title: string) => {
    try {
      const response = await llmAPI.updateTitle(id, title);
      if (response.rlt === '0' && response.data) {
        const index = conversations.value.findIndex(c => c.id === id);
        if (index !== -1 && conversations.value[index]) {
          conversations.value[index].title = response.data.title;
        }
      }
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const addMessage = (message: Message) => {
    messages.value.push(message);
  };

  const appendToLastMessage = (chunk: string) => {
    if (messages.value.length === 0) return;
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content += chunk;
    }
  };

  const removeLastMessage = () => {
    if (messages.value.length === 0) return;
    messages.value.pop();
  };

  const clearMessages = () => {
    messages.value = [];
  };

  const switchConversation = async (id: number) => {
    if (currentConversationId.value === id) return;
    await loadMessages(id);
  };

  const getBills = async (conversationId: number): Promise<Bill[]> => {
    try {
      const response = await llmAPI.getBills(conversationId);
      if (response.rlt === '0') {
        return response.data || [];
      }
    } catch (error) {
      console.error('Failed to load bills:', error);
      ElMessage.error('加载账单失败');
    }
    return [];
  };

  const deleteBill = async (id: number) => {
    try {
      await llmAPI.deleteBill(id);
      ElMessage.success('删除成功');
    } catch (error) {
      console.error('Failed to delete bill:', error);
      ElMessage.error('删除失败');
    }
  };

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    loading,
    loadConversations,
    createConversation,
    deleteConversation,
    loadMessages,
    updateTitle,
    addMessage,
    appendToLastMessage,
    removeLastMessage,
    clearMessages,
    switchConversation,
    getBills,
    deleteBill,
  };
});
