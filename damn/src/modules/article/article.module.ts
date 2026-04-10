import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleType } from './entities/article-type.entity';
import { Article } from './entities/article.entity';
import { ArticleView } from './entities/article-view.entity';
import { ArticleLike } from './entities/article-like.entity';
import { ArticleTypeService } from './article-type.service';
import { ArticleService } from './article.service';
import { ArticleStatsService } from './article-stats.service';
import { ArticleTypeController } from './article-type.controller';
import { ArticleController } from './article.controller';
import { VisitorModule } from '../visitor/visitor.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleType, Article, ArticleView, ArticleLike]), VisitorModule],
  controllers: [ArticleTypeController, ArticleController],
  providers: [ArticleTypeService, ArticleService, ArticleStatsService],
})
export class ArticleModule {}
