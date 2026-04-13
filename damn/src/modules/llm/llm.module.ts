import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Bill } from './entities/bill.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Bill]), UploadModule],
  controllers: [LLMController],
  providers: [LLMService],
})
export class LLMModule {}
