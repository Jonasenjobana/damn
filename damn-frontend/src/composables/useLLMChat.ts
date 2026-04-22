import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useLLMStore } from '@/stores/modules/llm'
import { llmAPI } from '@/api/modules/llm'
import type { Message, StreamChunk } from '@/types/llm'

export interface UseLLMChatOptions {
  onMessageComplete?: () => void
}

export function useLLMChat(options?: UseLLMChatOptions) {
  const llmStore = useLLMStore()
  const streaming = ref(false)
  let currentController: { abort: () => void } | null = null

  const lastUserMessage = computed(() => {
    const messages = llmStore.messages
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]!.role === 'user') {
        return messages[i]
      }
    }
    return null
  })

  const canRetry = computed(() => {
    const messages = llmStore.messages
    if (messages.length === 0) return false
    const lastMessage = messages[messages.length - 1]
    return lastMessage!.role === 'assistant' &&
      (lastMessage!.content === '' || lastMessage!.content.startsWith('❌'))
  })

  const stopGeneration = (): void => {
    if (currentController) {
      currentController.abort()
      currentController = null
      streaming.value = false
    }
  }

  const retryLastMessage = (): void => {
    const userMessage = lastUserMessage.value
    if (!userMessage || !llmStore.currentConversationId) {
      ElMessage.warning('没有可重试的消息')
      return
    }

    stopGeneration()

    const messages = llmStore.messages
    if (messages.length > 0 && messages[messages.length - 1]!.role === 'assistant') {
      llmStore.removeLastMessage()
    }

    sendMessage(userMessage.content)
  }

  const sendMessage = async (content: string): Promise<void> => {
    if (!llmStore.currentConversationId) {
      ElMessage.warning('请先选择对话')
      return
    }

    stopGeneration()

    const conversationId = llmStore.currentConversationId
    const userMessage: Message = {
      id: Date.now(),
      conversationId,
      role: 'user',
      content,
      createTime: new Date().toISOString(),
    }
    llmStore.addMessage(userMessage)

    const assistantMessage: Message = {
      id: Date.now() + 1,
      conversationId,
      role: 'assistant',
      content: '',
      createTime: new Date().toISOString(),
    }
    llmStore.addMessage(assistantMessage)
    streaming.value = true

    currentController = llmAPI.chat(
      conversationId,
      content,
      (chunk: StreamChunk) => {
        if (chunk.error) {
          ElMessage.error(chunk.error)
          streaming.value = false
          currentController = null
          return
        }
        if (chunk.chunk) {
          llmStore.appendToLastMessage(chunk.chunk)
        }
        if (chunk.done) {
          streaming.value = false
          currentController = null
          if (options?.onMessageComplete) {
            options.onMessageComplete()
          }

          if (llmStore.conversations[0]?.id === conversationId) {
            const firstLine = content.split('\n')[0]
            if (firstLine) {
              let title = firstLine.slice(0, 30)
              if (firstLine.length > 30) title += '...'
              llmStore.updateTitle(conversationId, title)
            }
          }
        }
      },
      (error: Error) => {
        ElMessage.error('聊天失败: ' + error.message)
        streaming.value = false
        currentController = null
      },
      () => {
        streaming.value = false
        currentController = null
      },
    )
  }

  const createNewConversation = async (
    modelName?: string,
    conversationType?: 'chat' | 'bill'
  ): Promise<void> => {
    await llmStore.createConversation(modelName, conversationType)
  }

  const selectConversation = async (id: number): Promise<void> => {
    await llmStore.switchConversation(id)
  }

  const deleteConversation = async (id: number): Promise<void> => {
    await llmStore.deleteConversation(id)
  }

  const loadConversations = async (): Promise<void> => {
    await llmStore.loadConversations()
  }

  return {
    conversations: computed(() => llmStore.conversations),
    currentConversationId: computed(() => llmStore.currentConversationId),
    currentConversation: computed(() => llmStore.currentConversation),
    messages: computed(() => llmStore.messages),
    streaming,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    loadConversations,
    stopGeneration,
    retryLastMessage,
    canRetry,
  }
}
