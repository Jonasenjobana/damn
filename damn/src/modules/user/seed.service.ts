import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { PasswordService } from './password.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
  ) {}

  async seedAdmin() {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    const existingAdmin = await this.userService.findByUsername(adminUsername);
    if (existingAdmin) {
      this.logger.log(`管理员账号 ${adminUsername} 已存在，跳过创建`);
      return;
    }

    await this.userService.create({
      username: adminUsername,
      password: adminPassword,
      phone: '',
      status: 1,
      is_admin: 1,
    });
    this.logger.log(`管理员账号创建成功！用户名: ${adminUsername}, 密码: ${adminPassword}`);
  }
}
