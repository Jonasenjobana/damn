import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordViewDurationDto {
  @ApiProperty({ description: '本次浏览时长（秒）', example: 30 })
  @IsNotEmpty({ message: '浏览时长不能为空' })
  @IsInt({ message: '浏览时长必须是整数' })
  @Min(1, { message: '浏览时长不能小于1秒' })
  duration: number;
}
