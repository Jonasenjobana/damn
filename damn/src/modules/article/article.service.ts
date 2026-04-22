import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ArticleStatsService } from './article-stats.service';
import { formatDate } from '../../common/utils';

function formatArticleDates(article: any): any {
  return {
    ...article,
    createTime: article.create_time ? formatDate(new Date(article.create_time)) : null,
    updateTime: article.update_time ? formatDate(new Date(article.update_time)) : null,
  };
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    private articleStatsService: ArticleStatsService,
  ) {}

  async findAll() {
    const articles = await this.articleRepo.find({
      where: { is_deleted: 0 },
      relations: ['article_type'],
      order: { is_pinned: 'DESC', sort: 'ASC', create_time: 'DESC' },
    });
    return articles.map(formatArticleDates);
  }

  async findOne(id: number) {
    const article = await this.articleRepo.findOne({
      where: { id, is_deleted: 0 },
      relations: ['article_type'],
    });
    return article ? formatArticleDates(article) : null;
  }

  create(createDto: CreateArticleDto) {
    const article = this.articleRepo.create(createDto);
    return this.articleRepo.save(article);
  }

  async update(id: number, updateDto: UpdateArticleDto) {
    const article = await this.findOne(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    Object.assign(article, updateDto);
    return this.articleRepo.save(article);
  }

  async remove(id: number) {
    const article = await this.findOne(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    article.is_deleted = 1;
    return this.articleRepo.save(article);
  }

  async togglePin(id: number) {
    const article = await this.findOne(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    article.is_pinned = article.is_pinned === 1 ? 0 : 1;
    return this.articleRepo.save(article);
  }

  async incrementViewCount(id: number, fingerprint: string): Promise<void> {
    const hasViewed = await this.articleStatsService.hasViewedRecently(id, fingerprint);
    if (!hasViewed) {
      await this.articleRepo
        .createQueryBuilder()
        .update(Article)
        .set({ 
          view_count: () => 'view_count + 1',
          update_time: new Date(),
        })
        .where('id = :id', { id })
        .execute();
      await this.articleStatsService.recordView(id, fingerprint);
    }
  }

  async recordViewDuration(id: number, fingerprint: string, duration: number): Promise<void> {
    const article = await this.findOne(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    await this.articleRepo
      .createQueryBuilder()
      .update(Article)
      .set({ 
        total_view_duration: () => `total_view_duration + ${duration}`,
        update_time: new Date(),
      })
      .where('id = :id', { id })
      .execute();

    await this.articleStatsService.recordViewDuration(id, fingerprint, duration);
  }

  async toggleLike(id: number, fingerprint: string, userId?: number): Promise<{ liked: boolean; likeCount: number }> {
    const result = await this.articleStatsService.toggleLike(id, fingerprint, userId);

    await this.articleRepo
      .createQueryBuilder()
      .update(Article)
      .set({ 
        like_count: () => `like_count ${result.liked ? '+' : '-'} 1`,
        update_time: new Date(),
      })
      .where('id = :id', { id })
      .execute();

    const article = await this.findOne(id);

    return {
      liked: result.liked,
      likeCount: article?.like_count || 0,
    };
  }

  async getArticleStats(id: number, fingerprint: string, userId?: number) {
    const article = await this.findOne(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const liked = await this.articleStatsService.hasLiked(id, fingerprint, userId);

    return {
      viewCount: article.view_count,
      likeCount: article.like_count,
      totalViewDuration: article.total_view_duration,
      liked,
    };
  }
}
