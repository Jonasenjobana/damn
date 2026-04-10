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

describe('Auth and User (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string[];

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
    it('should login as admin and get cookie', async () => {
      console.log('🔍 Testing login endpoint: POST /api/auth/login');
      
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      console.log('📥 Response status:', response.status);
      console.log('📦 Response body:', JSON.stringify(response.body, null, 2));
      console.log('🍪 Response headers:', JSON.stringify(response.headers, null, 2));
      
      if (response.headers['set-cookie']) {
        console.log('🍪 Set-Cookie:', response.headers['set-cookie']);
        authCookie = response.headers['set-cookie'] as unknown as string[];
      } else {
        console.log('⚠️ No set-cookie found!');
      }

      expect(response.status).toBe(201);
      expect(response.body.rlt).toBe('0');
      expect(response.body.data.user.username).toBe('admin');
    });

    it('should return 401 for wrong password', async () => {
      console.log('🔍 Testing wrong password: POST /api/auth/login');
      
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        });

      console.log('📥 Response status:', response.status);
      console.log('📦 Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(401);
      expect(response.body.rlt).toBe('1');
    });
  });

  describe('User - Protected Routes', () => {
    it('should return 401 when accessing profile without auth', async () => {
      console.log('🔍 Testing protected endpoint without auth: GET /api/user/profile');
      
      const response = await request(app.getHttpServer())
        .get('/api/user/profile');

      console.log('📥 Response status:', response.status);
      console.log('📦 Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(401);
    });

    it('should access profile with valid cookie', async () => {
      console.log('🔍 Testing protected endpoint with cookie: GET /api/user/profile');
      console.log('🍪 Using cookie:', authCookie);
      
      const response = await request(app.getHttpServer())
        .get('/api/user/profile')
        .set('Cookie', authCookie);

      console.log('📥 Response status:', response.status);
      console.log('📦 Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
      expect(response.body.rlt).toBe('0');
      expect(response.body.data.user.username).toBe('admin');
    });

    it('should access admin info', async () => {
      console.log('🔍 Testing admin endpoint: GET /api/user/admin');
      
      const response = await request(app.getHttpServer())
        .get('/api/user/admin')
        .set('Cookie', authCookie);

      console.log('📥 Response status:', response.status);
      console.log('📦 Response body:', JSON.stringify(response.body, null, 2));
      
      expect(response.status).toBe(200);
      expect(response.body.rlt).toBe('0');
      expect(response.body.data.isAdmin).toBe(true);
    });
  });
});
