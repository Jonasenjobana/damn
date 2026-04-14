import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import * as path from 'path';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { Bill, BillItem } from './entities/bill.entity';
import { getDefaultLLMConfig, LLMConfig, LLMProvider } from './config/llm.config';
import { BillTip } from './config/bill.prompt';
import { Observable } from 'rxjs';

export interface ChatMessageContentItem {
  type: string;
  image_url?: {
    url: string;
  };
  text?: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string | ChatMessageContentItem[];
}

interface BillRecognizeResponse {
  msg: string;
  rlt: number;
  data: Array<{
    type: string;
    date: string;
    name: string;
    price: number;
    from: string;
  }>;
}

@Injectable()
export class LLMService {
  private config: LLMConfig;

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private uploadService: UploadService,
  ) {
    this.config = getDefaultLLMConfig();
    console.log("🚀 ~ LLMService ~ constructor ~ this.config:", this.config);
  }

  async getConversations(userId: number): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { updateTime: 'DESC' },
    });
  }

  async createConversation(userId: number, modelName?: string, conversationType?: ConversationType): Promise<Conversation> {
    const conversation = new Conversation();
    conversation.userId = userId;
    conversation.title = '新对话';
    conversation.conversationType = conversationType || 'chat';
    conversation.modelName = modelName || this.config.model;
    conversation.createTime = new Date();
    conversation.updateTime = new Date();
    return this.conversationRepository.save(conversation);
  }

  async deleteConversation(id: number, userId: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
    });
    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }
    await this.billRepository.delete({ conversationId: id });
    await this.messageRepository.delete({ conversationId: id });
    await this.conversationRepository.delete(id);
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createTime: 'ASC' },
    });
  }

  async getBills(conversationId: number): Promise<Bill[]> {
    return this.billRepository.find({
      where: { conversationId },
      order: { createTime: 'ASC' },
    });
  }

  async deleteBill(id: number): Promise<void> {
    await this.billRepository.delete(id);
  }

  async createBillsFromJsonFile(
    conversationId: number,
    buffer: Buffer,
    originalFilename: string,
  ): Promise<number> {
    const jsonStr = buffer.toString('utf8');
    const result = JSON.parse(jsonStr) as BillRecognizeResponse;

    if (!result.data || result.data.length === 0) {
      return 0;
    }

    const now = new Date();
    let count = 0;
    for (const item of result.data) {
      const bill = new Bill();
      bill.conversationId = conversationId;
      bill.type = item.type || '其他';
      bill.date = item.date || now.toISOString().slice(0, 19).replace('T', ' ');
      bill.from = item.from || '其他';
      bill.totalAmount = item.price || 0;
      bill.itemsJson = JSON.stringify([{ name: item.name, price: item.price }]);
      bill.originalFile = originalFilename;
      bill.createTime = now;
      bill.updateTime = now;
      await this.billRepository.save(bill);
      count++;
    }

    return count;
  }

  async addMessage(
    conversationId: number,
    role: MessageRole,
    content: string,
    tokens?: number,
  ): Promise<Message> {
    const message = new Message();
    message.conversationId = conversationId;
    message.role = role;
    message.content = content;
    if (tokens !== undefined) {
      message.tokens = tokens;
    }
    message.createTime = new Date();
    await this.conversationRepository.update(conversationId, {
      updateTime: new Date(),
    });
    return this.messageRepository.save(message);
  }

  async updateConversationTitle(id: number, userId: number, title: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, userId },
    });
    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }
    conversation.title = title;
    conversation.updateTime = new Date();
    return this.conversationRepository.save(conversation);
  }

  private async buildMessages(messages: Message[], conversationType: ConversationType): Promise<ChatMessage[]> {
    let systemPrompt = '';
    if (conversationType === 'bill') {
      systemPrompt = BillTip;
    } else {
      systemPrompt = 'You are a helpful assistant.';
    }

    const chatMessages: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // 处理图片：提取 markdown 中的图片链接，下载转 base64
    const imageUrls: string[] = [];
    for (const msg of chatMessages) {
      if (typeof msg.content !== 'string') continue;
      const matches = msg.content.match(/!\[.*\]\(([^\s)]+)\)/g);
      if (matches) {
        for (const match of matches) {
          const urlMatch = match.match(/!\[.*\]\(([^\s)]+)\)/)!;
          const url = urlMatch[1];
          try {
            let buffer: Buffer;
            let mimeType: string;
            let filename: string;

            if (url.startsWith('http://') || url.startsWith('https://')) {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
              filename = url.split('/').pop() || 'unknown';
              const ext = filename.split('.').pop() || '';
              mimeType = ext ? `image/${ext}` : 'image/png';
              console.log(`[LLM Image] Processed remote image: url=${url}, size=${buffer.length} bytes`);
            } else {
              filename = url.split('/').pop() || '';
              if (!filename) {
                console.warn(`[LLM Image] Cannot extract filename from url: ${url}`);
                continue;
              }
              const uploadFile = await this.uploadService.findByFilename(filename);
              if (!uploadFile) {
                console.warn(`[LLM Image] Upload file not found: ${filename}`);
                continue;
              }
              buffer = await this.uploadService.readFileContent(filename);
              mimeType = uploadFile.mime_type || 'image/png';
              console.log(`[LLM Image] Processed uploaded file: filename=${filename}, id=${uploadFile.id}, size=${buffer.length} bytes`);
            }
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64}`;
            console.log(`[LLM Image] Final dataUrl length=${dataUrl.length}, preview=${dataUrl.substring(0, 100)}...`);
            chatMessages.push({
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            });
          } catch (e) {
            console.error('Failed to process image:', e);
          }
        }
      }
    }

    if (chatMessages.length === 0) {
      chatMessages.unshift({
        role: 'system',
        content: systemPrompt,
      });
    } else if (conversationType === 'bill') {
      chatMessages.unshift({
        role: 'system',
        content: systemPrompt,
      });
    }

    const maxMessages = this.config.maxContextMessages;
    if (chatMessages.length > maxMessages) {
      return chatMessages.slice(-maxMessages);
    }

    return chatMessages;
  }

  private extractJsonFromContent(content: string): string {
    const jsonBlockMatch = content.match(/```json\n([\s\S]*)\n```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim();
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0].trim();
    }
    return content.trim();
  }

  private async saveBills(conversationId: number, messageId: number, data: BillRecognizeResponse['data']): Promise<void> {
    const now = new Date();
    for (const item of data) {
      const bill = new Bill();
      bill.conversationId = conversationId;
      bill.messageId = messageId;
      bill.type = item.type || '其他';
      bill.date = item.date || now.toISOString().slice(0, 19).replace('T', ' ');
      bill.from = item.from || '其他';
      bill.totalAmount = item.price || 0;
      bill.itemsJson = JSON.stringify([{ name: item.name, price: item.price }]);
      bill.createTime = now;
      bill.updateTime = now;
      await this.billRepository.save(bill);
    }
  }

  async streamChat(
    conversationId: number,
    userContent: string,
  ): Promise<Observable<{ chunk: string; done: boolean }>> {
    const conversation = await this.conversationRepository.findOneBy({ id: conversationId });
    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    await this.addMessage(conversationId, 'user', userContent);

    const existingMessages = await this.getMessages(conversationId);
    const messages = await this.buildMessages(existingMessages, conversation.conversationType);

    return new Observable<{ chunk: string; done: boolean }>(subscriber => {
      this.callLLMStream(messages, conversationId, conversation.conversationType, subscriber);
    });
  }

  private buildRequestBody(provider: LLMProvider, model: string, temperature: number, maxTokens: number, messages: ChatMessage[]) {
    if (provider === 'anthropic') {
      return {
        model,
        messages,
        stream: true,
        temperature,
        max_tokens: maxTokens,
        anthropic_version: 'vertex-2023-10-16',
      };
    }

    return {
      model,
      messages,
      stream: true,
      temperature,
      max_tokens: maxTokens,
    };
  }

  private extractChunk(provider: LLMProvider, parsed: any): string | null {
    if (provider === 'anthropic') {
      return parsed.type === 'content_block_delta' ? parsed.delta?.text : null;
    }

    return parsed.choices?.[0]?.delta?.content || null;
  }

  private joinURL(base: string, path: string): string {
    const baseSlash = base.endsWith('/') ? base : base + '/';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(cleanPath, baseSlash).toString();
  }

  private async callLLMStream(
    messages: ChatMessage[],
    conversationId: number,
    conversationType: ConversationType,
    subscriber: any,
  ): Promise<void> {
    const { apiKey, baseURL, provider, model, temperature, maxTokens } = this.config;

    if (!apiKey) {
      subscriber.error(new Error('LLM API Key 未配置'));
      return;
    }

    try {
      const endpoint = provider === 'anthropic'
        ? this.joinURL(baseURL, 'v1/messages')
        : this.joinURL(baseURL, 'chat/completions');

      const body = this.buildRequestBody(provider, model, temperature, maxTokens, messages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        subscriber.error(new Error(`LLM API 错误: ${response.status} - ${error}`));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        subscriber.error(new Error('无法读取响应流'));
        return;
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (conversationType === 'bill') {
            try {
              const jsonStr = this.extractJsonFromContent(fullContent);
              const result = JSON.parse(jsonStr) as BillRecognizeResponse;
              if (result.rlt === 0 && result.data && result.data.length > 0) {
                const lastMessage = await this.addMessage(conversationId, 'assistant', fullContent);
                await this.saveBills(conversationId, lastMessage.id, result.data);
              }
            } catch (e) {
              console.error('Failed to parse bill JSON:', e);
            }
          } else {
            const estimatedTokens = Math.ceil(fullContent.length / 4);
            await this.addMessage(
              conversationId,
              'assistant',
              fullContent,
              estimatedTokens,
            );
          }
          subscriber.next({ chunk: '', done: true });
          subscriber.complete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        fullResponse += chunk;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              continue;
            }
            if (data) {
              try {
                const parsed = JSON.parse(data);
                const delta = this.extractChunk(provider, parsed);
                if (delta) {
                  fullContent += delta;
                  subscriber.next({ chunk: delta, done: false });
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (error) {
      subscriber.error(error as Error);
    }
  }
}
