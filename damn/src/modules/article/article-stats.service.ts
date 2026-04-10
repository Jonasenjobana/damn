import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleView } from './entities/article-view.entity';
import { ArticleLike } from './entities/article-like.entity';

const FINGERPRINT_EXPIRES_HOURS = 1;

@Injectable()
export class ArticleStatsService {
  constructor(
    @InjectRepository(ArticleView)
    private articleViewRepo: Repository<ArticleView>,
    @InjectRepository(ArticleLike)
    private articleLikeRepo: Repository<ArticleLike>,
  ) {}

  async hasViewedRecently(articleId: number, fingerprint: string): Promise<boolean> {
    const sinceTime = new Date();
    sinceTime.setHours(sinceTime.getHours() - FINGERPRINT_EXPIRES_HOURS);

    const view = await this.articleViewRepo.findOne({
      where: {
        article_id: articleId,
        fingerprint,
      },
    });

    if (!view) {
      return false;
    }

    return view.create_time > sinceTime;
  }

  async recordView(articleId: number, fingerprint: string): Promise<void> {
    const view = this.articleViewRepo.create({
      article_id: articleId,
      fingerprint,
      view_start_time: new Date(),
    });
    await this.articleViewRepo.save(view);
  }

  async recordViewDuration(articleId: number, fingerprint: string, duration: number): Promise<void> {
    const view = await this.articleViewRepo.findOne({
      where: {
        article_id: articleId,
        fingerprint,
      },
      order: { create_time: 'DESC' },
    });

    if (view) {
      await this.articleViewRepo
        .createQueryBuilder()
        .update(ArticleView)
        .set({ view_duration: () => `view_duration + ${duration}` })
        .where('id = :id', { id: view.id })
        .execute();
    }
  }

  async hasLiked(articleId: number, fingerprint: string, userId?: number): Promise<boolean> {
    const where: any = { article_id: articleId };
    if (userId) {
      where.user_id = userId;
    } else {
      where.fingerprint = fingerprint;
    }

    const like = await this.articleLikeRepo.findOne({ where });
    return !!like;
  }

  async toggleLike(articleId: number, fingerprint: string, userId?: number): Promise<{ liked: boolean }> {
    const where: any = { article_id: articleId };
    if (userId) {
      where.user_id = userId;
    } else {
      where.fingerprint = fingerprint;
    }

    const existingLike = await this.articleLikeRepo.findOne({ where });

    if (existingLike) {
      await this.articleLikeRepo.remove(existingLike);
      return { liked: false };
    } else {
      const like = this.articleLikeRepo.create({
        article_id: articleId,
        fingerprint: userId ? null : fingerprint,
        user_id: userId || null,
      });
      await this.articleLikeRepo.save(like);
      return { liked: true };
    }
  }
}
