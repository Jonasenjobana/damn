import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { ArticleModule } from './modules/article/article.module';
import { UploadModule } from './modules/upload/upload.module';
import { VisitorModule } from './modules/visitor/visitor.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'damn.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      logging: process.env.NODE_ENV !== 'production',
      migrations: ['src/migrations/*.ts'],
      migrationsRun: process.env.NODE_ENV === 'production',
    }),
    VisitorModule,
    CommonModule,
    UserModule,
    AuthModule,
    ArticleModule,
    UploadModule,
  ],
})
export class AppModule {}
