import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SeedService } from './../src/modules/user/seed.service';
import { LoggingInterceptor } from './../src/common/logging.interceptor';
import { HttpExceptionFilter } from './../src/common/http-exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

describe('Article (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string[];
  let articleTypeId: number;
  let articleId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalInterceptors(app.get(LoggingInterceptor));
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.init();
    
    const seedService = app.get(SeedService);
    await seedService.seedAdmin();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth - Login', () => {
    it('should login as admin', async () => {
      console.log('🔍 Testing login: POST /api/auth/login');
      
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      if (response.headers['set-cookie']) {
        console.log('🍪 Cookie:', response.headers['set-cookie']);
        authCookie = response.headers['set-cookie'] as unknown as string[];
      } else {
        console.log('⚠️ No cookie!');
      }

      expect(response.status).toBe(201);
    });
  });

  describe('Article Type', () => {
    it('should create article type', async () => {
      console.log('🔍 Creating article type: POST /api/article-type/create');
      
      const response = await request(app.getHttpServer())
        .post('/api/article-type/create')
        .set('Cookie', authCookie)
        .send({
          name: '技术博客',
          sort: 0,
        });

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(201);
      articleTypeId = response.body.data.id;
    });

    it('should get article type list', async () => {
      console.log('🔍 Getting article type list: GET /api/article-type/list');
      
      const response = await request(app.getHttpServer())
        .get('/api/article-type/list');

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
    });
  });

  describe('Article', () => {
    it('should create article', async () => {
      console.log('🔍 Creating article: POST /api/article/create');
      
      const response = await request(app.getHttpServer())
        .post('/api/article/create')
        .set('Cookie', authCookie)
        .send({
          title: '测试文章',
          content: '# 测试标题\n\n这是测试内容',
          article_type_id: articleTypeId,
          cover: 'https://example.com/cover.jpg',
          sort: 0,
          is_pinned: 0,
          is_private: 0,
        });

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(201);
      articleId = response.body.data.id;
    });

    it('should get article list', async () => {
      console.log('🔍 Getting article list: GET /api/article/list');
      
      const response = await request(app.getHttpServer())
        .get('/api/article/list');

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
    });

    it('should get article detail', async () => {
      console.log('🔍 Getting article detail: GET /api/article/:id');
      
      const response = await request(app.getHttpServer())
        .get(`/api/article/${articleId}`);

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
    });

    it('should pin article', async () => {
      console.log('🔍 Pinning article: PUT /api/article/pin/:id');
      
      const response = await request(app.getHttpServer())
        .put(`/api/article/pin/${articleId}`)
        .set('Cookie', authCookie);

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
    });

    it('should delete article', async () => {
      console.log('🔍 Deleting article: DELETE /api/article/delete/:id');
      
      const response = await request(app.getHttpServer())
        .delete(`/api/article/delete/${articleId}`)
        .set('Cookie', authCookie);

      console.log('📥 Status:', response.status);
      console.log('📦 Body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
    });
  });
});
