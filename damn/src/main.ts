import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeedService } from './modules/user/seed.service';
import { LoggingInterceptor } from './common/logging.interceptor';
import { TransformInterceptor } from './common/transform.interceptor';
import { HttpExceptionFilter } from './common/http-exception.filter';
import cookieParser from 'cookie-parser';
import { VisitorFingerprintInterceptor } from './modules/visitor/visitor-fingerprint.interceptor';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cors({
    origin: true,
    credentials: true,
  }));
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
  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(TransformInterceptor),
    app.get(VisitorFingerprintInterceptor),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Damn Blog API')
    .setDescription('博客系统 API 文档')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const seedService = app.get(SeedService);
  await seedService.seedAdmin();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
