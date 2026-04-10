import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  @Expose()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  @Expose()
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码' })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 11, default: '', comment: '手机号' })
  @Expose()
  phone: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1-正常 0-禁用' })
  @Expose()
  status: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否管理员 1-是 0-否' })
  @Expose()
  is_admin: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  @Expose()
  create_time: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: '更新时间',
  })
  @Expose()
  update_time: Date;

  @Column({ type: 'tinyint', default: 0, comment: '是否删除 0-未删除 1-已删除' })
  @Exclude()
  is_deleted: number;
}
