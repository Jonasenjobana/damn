import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('upload_file')
export class UploadFile {
  @PrimaryGeneratedColumn({ type: 'int' })
  @Expose()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255, comment: '原始文件名' })
  @Expose()
  original_name: string;

  @Column({ type: 'varchar', length: 255, comment: '存储文件名（UUID）' })
  @Expose()
  filename: string;

  @Column({ type: 'varchar', length: 500, comment: '文件路径' })
  @Expose()
  path: string;

  @Column({ type: 'varchar', length: 100, comment: '文件类型' })
  @Expose()
  mime_type: string;

  @Column({ type: 'bigint', comment: '文件大小（字节）' })
  @Expose()
  size: number;

  @Column({ type: 'varchar', length: 20, comment: '文件扩展名' })
  @Expose()
  extension: string;

  @Column({ type: 'tinyint', default: 1, comment: '文件类型 1-图片 2-文件' })
  @Expose()
  type: number;

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
