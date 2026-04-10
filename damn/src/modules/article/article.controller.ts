import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { RecordViewDurationDto } from './dto/article-stats.dto';
import { ApiResponse as CustomApiResponse } from '../../common/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisitorFingerprintInterceptor } from '../visitor/visitor-fingerprint.interceptor';

@ApiTags('文章')
@UseInterceptors(VisitorFingerprintInterceptor)
@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get('list')
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({ status: 200, description: '成功返回文章列表' })
  async list() {
    const data = await this.articleService.findAll();
    return CustomApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文章详情（自动增加浏览次数）' })
  @ApiResponse({ status: 200, description: '成功返回文章详情' })
  async getOne(@Param('id') id: string, @Request() req: any) {
    const fingerprint = req.visitorFingerprint;
    const data = await this.articleService.findOne(Number(id));
    await this.articleService.incrementViewCount(Number(id), fingerprint);
    return CustomApiResponse.success(data);
  }

  @Post(':id/view')
  @ApiOperation({ summary: '记录浏览时长' })
  @ApiResponse({ status: 200, description: '记录成功' })
  async recordViewDuration(
    @Param('id') id: string,
    @Body() dto: RecordViewDurationDto,
    @Request() req: any,
  ) {
    const fingerprint = req.visitorFingerprint;
    await this.articleService.recordViewDuration(Number(id), fingerprint, dto.duration);
    return CustomApiResponse.success(null, '记录成功');
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞/取消点赞' })
  @ApiOkResponse({ description: '操作成功', schema: { properties: { liked: { type: 'boolean' }, likeCount: { type: 'number' } } } })
  async toggleLike(@Param('id') id: string, @Request() req: any) {
    const fingerprint = req.visitorFingerprint;
    const userId = req.user?.id;
    const result = await this.articleService.toggleLike(Number(id), fingerprint, userId);
    return CustomApiResponse.success(result);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取文章统计' })
  @ApiOkResponse({ description: '成功返回统计信息' })
  async getStats(@Param('id') id: string, @Request() req: any) {
    const fingerprint = req.visitorFingerprint;
    const userId = req.user?.id;
    const stats = await this.articleService.getArticleStats(Number(id), fingerprint, userId);
    return CustomApiResponse.success(stats);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章（需认证）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(@Body() createDto: CreateArticleDto) {
    const data = await this.articleService.create(createDto);
    return CustomApiResponse.success(data, '创建成功');
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章（需认证）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateArticleDto) {
    const data = await this.articleService.update(Number(id), updateDto);
    return CustomApiResponse.success(data, '更新成功');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章（需认证）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async remove(@Param('id') id: string) {
    await this.articleService.remove(Number(id));
    return CustomApiResponse.success(null, '删除成功');
  }

  @UseGuards(JwtAuthGuard)
  @Put('pin/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '置顶/取消置顶文章（需认证）' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async togglePin(@Param('id') id: string) {
    const data = await this.articleService.togglePin(Number(id));
    return CustomApiResponse.success(data, data.is_pinned === 1 ? '置顶成功' : '取消置顶成功');
  }
}
