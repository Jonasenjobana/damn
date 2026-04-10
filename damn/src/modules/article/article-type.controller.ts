import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ArticleTypeService } from './article-type.service';
import { CreateArticleTypeDto, UpdateArticleTypeDto } from './dto/article-type.dto';
import { ApiResponse as CustomApiResponse } from '../../common/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('文章类型')
@Controller('article-type')
export class ArticleTypeController {
  constructor(private articleTypeService: ArticleTypeService) {}

  @Get('list')
  @ApiOperation({ summary: '获取文章类型列表' })
  @ApiResponse({ status: 200, description: '成功返回文章类型列表' })
  async list() {
    const data = await this.articleTypeService.findAll();
    return CustomApiResponse.success(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章类型（需认证）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(@Body() createDto: CreateArticleTypeDto) {
    const data = await this.articleTypeService.create(createDto);
    return CustomApiResponse.success(data, '创建成功');
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章类型（需认证）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateArticleTypeDto) {
    const data = await this.articleTypeService.update(Number(id), updateDto);
    return CustomApiResponse.success(data, '更新成功');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章类型（需认证）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async remove(@Param('id') id: string) {
    await this.articleTypeService.remove(Number(id));
    return CustomApiResponse.success(null, '删除成功');
  }
}
