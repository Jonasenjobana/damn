import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadService } from '../upload/upload.service';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { Bill, BillItem } from './entities/bill.entity';
import { getDefaultLLMConfig, LLMConfig } from './config/llm.config';
import { BillTip } from './config/bill.prompt';
import { Observable } from 'rxjs';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { formatDate } from '../../common/utils';

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

  async getConversations(userId: number): Promise<any[]> {
    const conversations = await this.conversationRepository.find({
      where: { userId },
      order: { updateTime: 'DESC' },
    });
    return conversations.map(conv => ({
      ...conv,
      createTime: formatDate(conv.createTime),
      updateTime: formatDate(conv.updateTime),
    }));
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

  async getMessages(conversationId: number): Promise<any[]> {
    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createTime: 'ASC' },
    });
    return messages.map(msg => ({
      ...msg,
      createTime: formatDate(msg.createTime),
    }));
  }

  async getBills(conversationId: number): Promise<any[]> {
    const bills = await this.billRepository.find({
      where: { conversationId },
      order: { createTime: 'ASC' },
    });
    return bills.map(bill => ({
      ...bill,
      createTime: formatDate(bill.createTime),
      updateTime: formatDate(bill.updateTime),
    }));
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
      this.callLLMStream(messages, conversationId, conversation.conversationType, conversation.modelName, subscriber).catch(err => {
        subscriber.error(err);
      });
    });
  }

  private async callLLMStream(
    messages: ChatMessage[],
    conversationId: number,
    conversationType: ConversationType,
    modelName: string,
    subscriber: any,
  ): Promise<void> {
    const { apiKey, baseURL, temperature, maxTokens } = this.config;
    const model = modelName || this.config.model;

    if (!apiKey) {
      subscriber.error(new Error('LLM API Key 未配置'));
      return;
    }

    try {
      const openai = createOpenAI({
        apiKey,
        baseURL,
      });
      const aiModel = openai(model);

      const { textStream } = await streamText({
          model: aiModel,
          messages: messages as any,
          temperature,
          maxTokens,
        } as any);

      let fullContent = '';

      for await (const chunk of textStream) {
        fullContent += chunk;
        subscriber.next({ chunk, done: false });
      }

      if (conversationType === 'bill') {
        try {
          const jsonStr = this.extractJsonFromContent(fullContent);
          const result = JSON.parse(jsonStr) as BillRecognizeResponse;
          if (result.rlt === 0 && result.data && result.data.length > 0) {
            const lastMessage = await this.addMessage(conversationId, 'assistant', fullContent);
            await this.saveBills(conversationId, lastMessage.id, result.data);
          } else {
            const errorMsg = '❌ 账单识别失败：AI未能识别出有效的账单数据，请检查图片是否清晰，或重新上传。';
            await this.addMessage(conversationId, 'assistant', errorMsg);
            subscriber.error(new Error(errorMsg));
            return;
          }
        } catch (e) {
          console.error('Failed to parse bill JSON:', e);
          const errorMsg = '❌ 账单识别失败：无法解析AI返回结果，这可能是因为AI未能识别出这是账单，请重新上传或尝试其他模型。';
          await this.addMessage(conversationId, 'assistant', errorMsg);
          subscriber.error(new Error(errorMsg));
          return;
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      subscriber.error(new Error(`LLM 调用失败: ${errorMsg}`));
    }
  }
}
