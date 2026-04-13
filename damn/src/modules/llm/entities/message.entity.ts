import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';

export type MessageRole = 'system' | 'user' | 'assistant';

@Entity('llm_messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'tokens', nullable: true })
  tokens: number;

  @Column({ name: 'create_time', type: 'datetime' })
  createTime: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  conversation: Conversation;
}
