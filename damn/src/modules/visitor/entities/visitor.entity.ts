import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('visitor')
export class Visitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'visit_time' })
  visitTime: Date;
}
