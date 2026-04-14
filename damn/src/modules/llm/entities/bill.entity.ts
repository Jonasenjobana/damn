import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface BillItem {
  name: string;
  price: number;
}

@Entity('llm_bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'message_id', nullable: true })
  messageId: number;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, nullable: true })
  date: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'items_json', type: 'text', nullable: true })
  itemsJson: string;

  @Column({ length: 50, nullable: true })
  from: string;

  @Column({ name: 'original_file', length: 255, nullable: true })
  originalFile: string;

  @Column({ name: 'create_time', type: 'datetime' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime' })
  updateTime: Date;
}
