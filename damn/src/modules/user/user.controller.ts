import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse as CustomApiResponse } from '../../common/response';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功返回用户列表' })
  async list() {
    const data = await this.userService.findAll();
    return CustomApiResponse.success(data);
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() user) {
    const data = await this.userService.create(user);
    return CustomApiResponse.success(data, '创建成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取个人信息（需认证）' })
  @ApiResponse({ status: 200, description: '成功返回个人信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  getProfile(@Request() req) {
    return CustomApiResponse.success({
      user: req.user,
      message: '这是受保护的个人信息'
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员信息（需认证）' })
  @ApiResponse({ status: 200, description: '成功返回管理员信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  getAdminInfo(@Request() req) {
    return CustomApiResponse.success({
      user: req.user,
      isAdmin: req.user.isAdmin === 1,
      message: '这是管理员专属信息'
    });
  }
}
