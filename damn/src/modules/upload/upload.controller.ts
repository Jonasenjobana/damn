import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse as CustomApiResponse } from '../../common/response';
import * as path from 'path';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('上传')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传图片（需认证）' })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req: any, file: any, callback: any) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new ForbiddenException('只能上传图片文件'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(@UploadedFile() file: MulterFile) {
    const uploadFile = await this.uploadService.uploadFile(file, 1);
    return CustomApiResponse.success({
      id: uploadFile.id,
      filename: uploadFile.filename,
      path: uploadFile.path,
      url: `/api/upload/images/${uploadFile.filename}`,
      original_name: uploadFile.original_name,
      size: uploadFile.size,
    }, '上传成功');
  }

  @Get('images/:filename')
  @ApiOperation({ summary: '获取图片' })
  @ApiResponse({ status: 200, description: '成功返回图片' })
  @ApiResponse({ status: 404, description: '图片不存在' })
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!this.uploadService.fileExists(filename)) {
      throw new NotFoundException('图片不存在');
    }

    const filePath = this.uploadService.getFilePath(filename);
    const ext = path.extname(filename).toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除图片（需认证）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async deleteImage(@Param('id') id: string) {
    await this.uploadService.remove(Number(id));
    return CustomApiResponse.success(null, '删除成功');
  }
}
