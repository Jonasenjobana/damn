import { Module } from '@nestjs/common';
import { VisitorCoreModule } from './visitor-core.module';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { VisitorFingerprintInterceptor } from './visitor-fingerprint.interceptor';

@Module({
  imports: [VisitorCoreModule],
  controllers: [VisitorController],
  providers: [VisitorService, VisitorFingerprintInterceptor],
  exports: [VisitorService, VisitorCoreModule, VisitorFingerprintInterceptor],
})
export class VisitorModule {}
