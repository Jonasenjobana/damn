import { Module, Global, forwardRef } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ErrorStatsService } from './error-stats.service';
import { StatsController } from './stats.controller';
import { LoggingInterceptor } from './logging.interceptor';
import { TransformInterceptor } from './transform.interceptor';
import { VisitorModule } from '../modules/visitor/visitor.module';

@Global()
@Module({
  imports: [forwardRef(() => VisitorModule)],
  controllers: [StatsController],
  providers: [LoggerService, ErrorStatsService, LoggingInterceptor, TransformInterceptor],
  exports: [LoggerService, ErrorStatsService, LoggingInterceptor, TransformInterceptor],
})
export class CommonModule {}
