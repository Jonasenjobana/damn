import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('article_type')
export class ArticleType {
  @PrimaryGeneratedColumn({ type: 'int' })
  @Expose()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 50, comment: '类型名称' })
  @Expose()
  name: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  @Expose()
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1-正常 0-禁用' })
  @Expose()
  status: number;

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
