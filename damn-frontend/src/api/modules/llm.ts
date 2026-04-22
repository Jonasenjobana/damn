import request from '@/api/request';
import type { Conversation, Message, StreamChunk, Bill } from '@/types/llm';

export const llmAPI = {
  getConversations: (): Promise<{
    rlt: string;
    data: Conversation[];
  }> => {
    return request.get('/llm/conversations');
  },

  createConversation: (modelName?: string, conversationType?: 'chat' | 'bill'): Promise<{
    rlt: string;
    data: Conversation;
  }> => {
    return request.post('/llm/conversations', { modelName, conversationType });
  },

  deleteConversation: (id: number): Promise<{
    rlt: string;
    data: null;
  }> => {
    return request.delete(`/llm/conversations/${id}`);
  },

  getMessages: (id: number): Promise<{
    rlt: string;
    data: Message[];
  }> => {
    return request.get(`/llm/conversations/${id}/messages`);
  },

  updateConversation: (id: number, data: { title?: string }): Promise<{
    rlt: string;
    data: Conversation;
  }> => {
    return request.patch(`/llm/conversations/${id}`, data);
  },

  updateTitle: (id: number, title: string): Promise<{
    rlt: string;
    data: Conversation;
  }> => {
    return request.patch(`/llm/conversations/${id}`, { title });
  },

  getBills: (conversationId: number): Promise<{
    rlt: string;
    data: Bill[];
  }> => {
    return request.get(`/llm/conversations/${conversationId}/bills`);
  },

  deleteBill: (id: number): Promise<{
    rlt: string;
    data: null;
  }> => {
    return request.delete(`/llm/bills/${id}`);
  },

  chat: (
    conversationId: number,
    content: string,
    onChunk: (chunk: StreamChunk) => void,
    onError: (error: Error) => void,
    onComplete: () => void,
  ): { abort: () => void } => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const url = `${baseURL}/llm/conversations/${conversationId}/chat`;
    const controller = new AbortController();

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Credentials': 'include',
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法读取响应流');
        }
        const decoder = new TextDecoder();

        function read(): void {
          reader!.read().then(({ done, value }) => {
            if (done) {
              onComplete();
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data) {
                  try {
                    const parsed = JSON.parse(data);
                    onChunk(parsed);
                  } catch (e) {
                  }
                }
              }
            }
            read();
          }).catch(error => {
            if (error.name !== 'AbortError') {
              onError(error);
            }
          });
        }
        read();
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          onError(error);
        }
      });

    return {
      abort: () => controller.abort(),
    };
  },
};
