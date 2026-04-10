import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorStat {
  @ApiProperty({ description: '请求路径', example: '/api/article/create' })
  path: string;

  @ApiProperty({ description: '请求方法', example: 'POST' })
  method: string;

  @ApiProperty({ description: '错误类型', example: 'BadRequestException' })
  errorType: string;

  @ApiProperty({ description: '错误次数', example: 5 })
  count: number;

  @ApiProperty({ description: '最后错误时间', example: '2026-04-09T12:00:00.000Z' })
  lastErrorTime: Date;
}

export class ErrorStatsResponse {
  @ApiProperty({ description: '总错误数', example: 15 })
  totalErrors: number;

  @ApiProperty({ type: [ErrorStat], description: '错误统计列表' })
  errors: ErrorStat[];
}

@Injectable()
export class ErrorStatsService {
  private errorStats: Map<string, ErrorStat> = new Map();
  private totalErrors: number = 0;

  recordError(path: string, method: string, errorType: string): void {
    const key = `${method}:${path}:${errorType}`;
    const existing = this.errorStats.get(key);

    if (existing) {
      existing.count++;
      existing.lastErrorTime = new Date();
    } else {
      this.errorStats.set(key, {
        path,
        method,
        errorType,
        count: 1,
        lastErrorTime: new Date(),
      });
    }

    this.totalErrors++;
  }

  getStats(): ErrorStatsResponse {
    return {
      totalErrors: this.totalErrors,
      errors: Array.from(this.errorStats.values()),
    };
  }

  getStatsByPath(path: string): ErrorStat[] {
    return Array.from(this.errorStats.values()).filter(stat => stat.path === path);
  }

  getTopErrors(limit: number = 10): ErrorStat[] {
    return Array.from(this.errorStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clearStats(): void {
    this.errorStats.clear();
    this.totalErrors = 0;
  }
}
