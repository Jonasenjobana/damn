import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private passwordService: PasswordService,
  ) {}

  findAll() {
    return this.userRepo.find();
  }

  async create(user: Partial<User>) {
    if (user.password) {
      user.password = await this.passwordService.hashPassword(user.password);
    }
    return this.userRepo.save(user);
  }

  findOne(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  findByUsername(username: string) {
    return this.userRepo.findOneBy({ username });
  }
}
