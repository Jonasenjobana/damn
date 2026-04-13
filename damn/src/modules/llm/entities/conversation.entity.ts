import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from './message.entity';

export type ConversationType = 'chat' | 'bill';

@Entity('llm_conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, default: '新对话' })
  title: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'conversation_type', length: 20, default: 'chat' })
  conversationType: ConversationType;

  @Column({ name: 'model_name', length: 100, default: 'gpt-3.5-turbo' })
  modelName: string;

  @Column({ name: 'create_time', type: 'datetime' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime' })
  updateTime: Date;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}
