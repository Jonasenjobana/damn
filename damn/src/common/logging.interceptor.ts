import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.url;
    const params = {
      query: request.query,
      body: request.body,
      params: request.params,
    };

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.loggerService.logRequest(method, path, params, duration, response.statusCode);
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.loggerService.logError(method, path, error, params);
        },
      }),
    );
  }
}
