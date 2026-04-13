import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFile } from './entities/upload-file.entity';
import * as fs from 'fs';
import * as path from 'path';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadPath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'resource',
    'images',
  );

  constructor(
    @InjectRepository(UploadFile)
    private uploadFileRepo: Repository<UploadFile>,
  ) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: MulterFile,
    type: number = 1,
  ): Promise<UploadFile> {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadPath, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    const uploadFile = this.uploadFileRepo.create({
      original_name: file.originalname,
      filename,
      path: `/resource/images/${filename}`,
      mime_type: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname).substring(1),
      type,
      status: 1,
    });

    return this.uploadFileRepo.save(uploadFile);
  }

  async findOne(id: number): Promise<UploadFile> {
    const file = await this.uploadFileRepo.findOne({
      where: { id, is_deleted: 0 },
    });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    return file;
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    const filePath = path.join(this.uploadPath, file.filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    file.is_deleted = 1;
    await this.uploadFileRepo.save(file);
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadPath, filename);
  }

  fileExists(filename: string): boolean {
    const filePath = path.join(this.uploadPath, filename);
    return fs.existsSync(filePath);
  }
}
