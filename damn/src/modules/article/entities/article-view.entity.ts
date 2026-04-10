import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_view')
export class ArticleView {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index()
  @Column({ type: 'bigint', comment: '文章ID' })
  article_id: number;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @Index()
  @Column({ type: 'varchar', length: 100, comment: '访客指纹' })
  fingerprint: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '浏览开始时间',
  })
  view_start_time: Date;

  @Column({ type: 'int', default: 0, comment: '本次浏览时长（秒）' })
  view_duration: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  create_time: Date;
}
