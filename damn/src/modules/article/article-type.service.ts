import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleType } from './entities/article-type.entity';
import { CreateArticleTypeDto, UpdateArticleTypeDto } from './dto/article-type.dto';

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatTypeDates(type: any): any {
  return {
    ...type,
    createTime: type.create_time ? formatDate(new Date(type.create_time)) : null,
    updateTime: type.update_time ? formatDate(new Date(type.update_time)) : null,
  };
}

@Injectable()
export class ArticleTypeService {
  constructor(
    @InjectRepository(ArticleType)
    private articleTypeRepo: Repository<ArticleType>,
  ) {}

  async findAll() {
    const types = await this.articleTypeRepo.find({
      where: { is_deleted: 0 },
      order: { sort: 'ASC', create_time: 'DESC' },
    });
    return types.map(formatTypeDates);
  }

  async findOne(id: number) {
    const type = await this.articleTypeRepo.findOne({
      where: { id, is_deleted: 0 },
    });
    return type ? formatTypeDates(type) : null;
  }

  create(createDto: CreateArticleTypeDto) {
    const articleType = this.articleTypeRepo.create(createDto);
    return this.articleTypeRepo.save(articleType);
  }

  async update(id: number, updateDto: UpdateArticleTypeDto) {
    const articleType = await this.findOne(id);
    if (!articleType) {
      throw new NotFoundException('文章类型不存在');
    }
    Object.assign(articleType, updateDto);
    return this.articleTypeRepo.save(articleType);
  }

  async remove(id: number) {
    const articleType = await this.findOne(id);
    if (!articleType) {
      throw new NotFoundException('文章类型不存在');
    }
    articleType.is_deleted = 1;
    return this.articleTypeRepo.save(articleType);
  }
}
