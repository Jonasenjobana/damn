import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_like')
export class ArticleLike {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index()
  @Column({ type: 'bigint', comment: '文章ID' })
  article_id: number;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '访客指纹（未登录用户）' })
  fingerprint: string | null;

  @Index()
  @Column({ type: 'bigint', nullable: true, comment: '用户ID（登录用户）' })
  user_id: number | null;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  create_time: Date;
}
