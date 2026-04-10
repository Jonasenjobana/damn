import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ErrorStatsService, ErrorStatsResponse, ErrorStat } from './error-stats.service';
import { ApiResponse as CustomApiResponse } from './response';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@ApiTags('统计')
@Controller('stats')
export class StatsController {
  constructor(private errorStatsService: ErrorStatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('errors')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取报错统计（需认证）' })
  @ApiOkResponse({ description: '成功返回报错统计', type: ErrorStatsResponse })
  @ApiResponse({ status: 401, description: '未授权' })
  getErrorStats() {
    const stats = this.errorStatsService.getStats();
    return CustomApiResponse.success(stats);
  }

  @UseGuards(JwtAuthGuard)
  @Get('errors/top')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 Top 报错（需认证）' })
  @ApiOkResponse({ description: '成功返回 Top 报错', type: [ErrorStat] })
  @ApiResponse({ status: 401, description: '未授权' })
  getTopErrors() {
    const stats = this.errorStatsService.getTopErrors(10);
    return CustomApiResponse.success(stats);
  }

  @UseGuards(JwtAuthGuard)
  @Get('errors/clear')
  @ApiBearerAuth()
  @ApiOperation({ summary: '清空报错统计（需认证）' })
  @ApiResponse({ status: 200, description: '清空成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  clearErrorStats() {
    this.errorStatsService.clearStats();
    return CustomApiResponse.success(null, '统计已清空');
  }
}
