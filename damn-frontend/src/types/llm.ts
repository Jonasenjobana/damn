export type MessageRole = 'system' | 'user' | 'assistant';

export type ConversationType = 'chat' | 'bill';

export interface Conversation {
  id: number;
  title: string;
  userId: number;
  conversationType: ConversationType;
  modelName: string;
  createTime: string;
  updateTime: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: MessageRole;
  content: string;
  tokens?: number;
  createTime: string;
}

export interface BillItem {
  name: string;
  price: number;
}

export interface Bill {
  id: number;
  conversationId: number;
  messageId: number;
  type: string;
  date: string;
  totalAmount: number;
  itemsJson: string;
  from: string;
  createTime: string;
  updateTime: string;

  items?: BillItem[];
}

export interface StreamChunk {
  chunk: string;
  done: boolean;
  error?: string;
}
