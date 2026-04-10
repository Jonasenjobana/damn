import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ArticleType } from './article-type.entity';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn({ type: 'int' })
  @Expose()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 200, comment: '文章标题' })
  @Expose()
  title: string;

  @Column({ type: 'text', comment: '文章内容（MD格式）' })
  @Expose()
  content: string;

  @Column({ type: 'varchar', length: 500, default: '', comment: '封面URL' })
  @Expose()
  cover: string;

  @Index()
  @Column({ type: 'bigint', comment: '文章类型ID' })
  @Expose()
  article_type_id: number;

  @ManyToOne(() => ArticleType)
  @JoinColumn({ name: 'article_type_id' })
  @Exclude()
  article_type: ArticleType;

  @Expose()
  @Transform(({ obj }) => obj.article_type?.name || '')
  articleTypeName?: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  @Expose()
  sort: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否置顶 1-是 0-否' })
  @Expose()
  is_pinned: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否私密 1-是 0-否' })
  @Expose()
  is_private: number;

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

  @Column({ type: 'int', default: 0, comment: '浏览次数' })
  @Expose()
  view_count: number;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  @Expose()
  like_count: number;

  @Column({ type: 'int', default: 0, comment: '总浏览时长（秒）' })
  @Expose()
  total_view_duration: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否删除 0-未删除 1-已删除' })
  @Exclude()
  is_deleted: number;
}
