import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleTypeDto {
  @ApiProperty({ description: '类型名称', example: '技术博客' })
  @IsNotEmpty({ message: '类型名称不能为空' })
  @IsString({ message: '类型名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  sort?: number;
}

export class UpdateArticleTypeDto {
  @ApiProperty({ description: '类型名称', required: false, example: '技术博客' })
  @IsOptional()
  @IsString({ message: '类型名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  sort?: number;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  status?: number;
}
