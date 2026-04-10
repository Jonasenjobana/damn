import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { userId: 1, username: 'testuser', isAdmin: 0 };
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return all users with ApiResponse format', async () => {
      const expectedUsers = [{ id: 1, username: 'test' }];
      mockUserService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.list();

      expect(result.rlt).toBe('0');
      expect(result.data).toEqual(expectedUsers);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create user with ApiResponse format', async () => {
      const createUser = { username: 'test', password: '123456' };
      const expectedUser = { id: 1, ...createUser };
      mockUserService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUser);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('创建成功');
      expect(result.data).toEqual(expectedUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createUser);
    });
  });

  describe('getProfile', () => {
    it('should return user profile with session info and ApiResponse format', () => {
      const mockRequest = {
        user: { userId: 1, username: 'testuser', isAdmin: 0 },
      };

      const result = controller.getProfile(mockRequest);

      expect(result.rlt).toBe('0');
      expect(result.data?.user).toEqual(mockRequest.user);
      expect(result.data?.message).toBe('这是受保护的个人信息');
    });
  });

  describe('getAdminInfo', () => {
    it('should return admin info with isAdmin flag and ApiResponse format', () => {
      const mockRequest = {
        user: { userId: 1, username: 'admin', isAdmin: 1 },
      };

      const result = controller.getAdminInfo(mockRequest);

      expect(result.rlt).toBe('0');
      expect(result.data?.user).toEqual(mockRequest.user);
      expect(result.data?.isAdmin).toBe(true);
      expect(result.data?.message).toBe('这是管理员专属信息');
    });

    it('should return isAdmin false for non-admin users with ApiResponse format', () => {
      const mockRequest = {
        user: { userId: 2, username: 'user', isAdmin: 0 },
      };

      const result = controller.getAdminInfo(mockRequest);

      expect(result.rlt).toBe('0');
      expect(result.data?.isAdmin).toBe(false);
    });
  });
});
