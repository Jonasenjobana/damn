import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: '文章标题', example: '我的第一篇文章' })
  @IsNotEmpty({ message: '文章标题不能为空' })
  @IsString({ message: '文章标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '文章内容', example: '# 标题\n\n这是文章内容' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  @IsString({ message: '文章内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '封面URL', required: false, example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  cover?: string;

  @ApiProperty({ description: '文章类型ID', example: 1 })
  @IsNotEmpty({ message: '文章类型不能为空' })
  @IsInt({ message: '文章类型必须是整数' })
  article_type_id: number;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  sort?: number;

  @ApiProperty({ description: '是否置顶', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '是否置顶必须是整数' })
  is_pinned?: number;

  @ApiProperty({ description: '是否私密', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '是否私密必须是整数' })
  is_private?: number;
}

export class UpdateArticleDto {
  @ApiProperty({ description: '文章标题', required: false, example: '我的第一篇文章' })
  @IsOptional()
  @IsString({ message: '文章标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '文章内容', required: false, example: '# 标题\n\n这是文章内容' })
  @IsOptional()
  @IsString({ message: '文章内容必须是字符串' })
  content?: string;

  @ApiProperty({ description: '封面URL', required: false, example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  cover?: string;

  @ApiProperty({ description: '文章类型ID', required: false, example: 1 })
  @IsOptional()
  @IsInt({ message: '文章类型必须是整数' })
  article_type_id?: number;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  sort?: number;

  @ApiProperty({ description: '是否置顶', required: false, example: 1 })
  @IsOptional()
  @IsInt({ message: '是否置顶必须是整数' })
  is_pinned?: number;

  @ApiProperty({ description: '是否私密', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '是否私密必须是整数' })
  is_private?: number;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  status?: number;
}
