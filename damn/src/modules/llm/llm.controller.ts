import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LLMService } from './llm.service';
import { ApiResponse as CustomApiResponse } from '../../common/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import type { Response } from 'express';

class CreateConversationDto {
  modelName?: string;
  conversationType?: 'chat' | 'bill';
}

class ChatRequestDto {
  content: string;
}

class UpdateConversationDto {
  title?: string;
}

@ApiTags('LLM聊天')
@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取会话列表' })
  @ApiResponse({ status: 200, description: '成功返回会话列表' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getConversations(@Request() req: any) {
    const data = await this.llmService.getConversations(req.user.userId);
    return CustomApiResponse.success(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建新会话' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async createConversation(@Request() req: any, @Body() dto: CreateConversationDto) {
    const data = await this.llmService.createConversation(req.user.userId, dto.modelName, dto.conversationType);
    return CustomApiResponse.success(data, '创建成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/bills')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取会话下的账单列表' })
  @ApiResponse({ status: 200, description: '成功返回账单列表' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getBills(@Param('id') id: string) {
    const data = await this.llmService.getBills(parseInt(id));
    return CustomApiResponse.success(data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('bills/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除账单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async deleteBill(@Param('id') id: string) {
    await this.llmService.deleteBill(parseInt(id));
    return CustomApiResponse.success(null, '删除成功');
  }

  @Post('conversations/:id/bills/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传JSON文件导入账单' })
  @ApiResponse({ status: 200, description: '导入成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async uploadBillsFromJson(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const count = await this.llmService.createBillsFromJsonFile(
      parseInt(id),
      file.buffer,
      file.originalname,
    );
    return CustomApiResponse.success({ count }, `成功导入 ${count} 条账单`);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('conversations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除会话' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async deleteConversation(@Param('id') id: string, @Request() req: any) {
    await this.llmService.deleteConversation(parseInt(id), req.user.userId);
    return CustomApiResponse.success(null, '删除成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取会话消息列表' })
  @ApiResponse({ status: 200, description: '成功返回消息列表' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getMessages(@Param('id') id: string) {
    const data = await this.llmService.getMessages(parseInt(id));
    return CustomApiResponse.success(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('conversations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新会话信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async updateConversation(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateConversationDto,
  ) {
    if (dto.title === undefined) {
      return CustomApiResponse.error('标题不能为空');
    }
    const data = await this.llmService.updateConversationTitle(
      parseInt(id),
      req.user.userId,
      dto.title,
    );
    return CustomApiResponse.success(data, '更新成功');
  }

  @Post('conversations/:id/chat')
  @ApiOperation({ summary: '发送消息并流式返回AI响应' })
  @ApiResponse({ status: 200, description: '返回SSE流式响应' })
  async chat(
    @Param('id') id: string,
    @Body() dto: ChatRequestDto,
    @Res() res: Response,
  ) {
    const conversationId = parseInt(id);
    const observable = await this.llmService.streamChat(conversationId, dto.content);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    observable.subscribe({
      next: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      },
    });
  }
}
