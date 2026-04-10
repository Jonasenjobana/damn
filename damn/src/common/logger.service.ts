import { Injectable, Logger } from '@nestjs/common';
import { ErrorStatsService } from './error-stats.service';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  constructor(private errorStatsService: ErrorStatsService) {}

  logRequest(method: string, path: string, params: any, duration: number, statusCode: number) {
    this.logger.log(
      `[${method}] ${path} - Status: ${statusCode} - Duration: ${duration}ms - Params: ${JSON.stringify(params)}`,
    );
  }

  logError(method: string, path: string, error: Error, params: any) {
    this.logger.error(
      `[${method}] ${path} - Error: ${error.message} - Params: ${JSON.stringify(params)}`,
      error.stack,
    );
    this.errorStatsService.recordError(path, method, error.constructor.name);
  }
}
