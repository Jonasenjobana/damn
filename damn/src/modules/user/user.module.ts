import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [UserService, PasswordService, SeedService],
  exports: [UserService, PasswordService, SeedService],
})
export class UserModule {}
