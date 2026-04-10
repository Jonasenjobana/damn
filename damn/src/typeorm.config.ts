import { DataSource } from 'typeorm';
import { User } from './modules/user/entities/user.entity';
import { Article } from './modules/article/entities/article.entity';
import { ArticleType } from './modules/article/entities/article-type.entity';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'damn.db',
  entities: [User, Article, ArticleType],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  logging: true,
});
