import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockRes = {
    cookie: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return ApiResponse with user info and set cookie on successful login', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };
      const authResult = {
        access_token: 'test-token',
        user: { id: 1, username: 'admin', isAdmin: 1 },
      };

      mockAuthService.login.mockResolvedValue(authResult);

      const result = await controller.login(loginDto, mockRes as any);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('登录成功');
      expect(result.data).toEqual({ user: authResult.user });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'test-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        }),
      );
    });
  });
});
