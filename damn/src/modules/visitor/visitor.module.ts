import { Module } from '@nestjs/common';
import { VisitorCoreModule } from './visitor-core.module';
import { VisitorService } from './visitor.service';
import { VisitorController } from './visitor.controller';
import { VisitorFingerprintInterceptor } from './visitor-fingerprint.interceptor';

@Module({
  // 从 providers 和 exports 中移除 VisitorFingerprintInterceptor 相关配置
  // providers: [VisitorService, VisitorFingerprintInterceptor],
  // exports: [VisitorService, VisitorCoreModule, VisitorFingerprintInterceptor],
  imports: [VisitorCoreModule],
  controllers: [VisitorController],
  providers: [VisitorService, VisitorFingerprintInterceptor],
  exports: [VisitorService, VisitorCoreModule, VisitorFingerprintInterceptor],
})
export class VisitorModule {}
