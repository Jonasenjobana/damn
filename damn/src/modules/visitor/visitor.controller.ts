import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisitorService } from './visitor.service';

@Controller('visitor')
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats() {
    return {
      rlt: '0',
      msg: 'success',
      data: await this.visitorService.getVisitorStats(),
    };
  }
}
