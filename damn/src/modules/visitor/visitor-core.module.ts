import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor } from './entities/visitor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visitor])],
  exports: [TypeOrmModule],
})
export class VisitorCoreModule {}
