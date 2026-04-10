import { Test, TestingModule } from '@nestjs/testing';
import { ArticleTypeController } from './article-type.controller';
import { ArticleTypeService } from './article-type.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ArticleTypeController', () => {
  let controller: ArticleTypeController;
  let articleTypeService: ArticleTypeService;

  const mockArticleTypeService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      controllers: [ArticleTypeController],
      providers: [
        {
          provide: ArticleTypeService,
          useValue: mockArticleTypeService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ArticleTypeController>(ArticleTypeController);
    articleTypeService = module.get<ArticleTypeService>(ArticleTypeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return article type list', async () => {
      const expectedTypes = [{ id: 1, name: '技术' }];
      mockArticleTypeService.findAll.mockResolvedValue(expectedTypes);

      const result = await controller.list();

      expect(result.rlt).toBe('0');
      expect(result.data).toEqual(expectedTypes);
      expect(mockArticleTypeService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create article type', async () => {
      const createDto = { name: '技术', sort: 0 };
      const expectedType = { id: 1, ...createDto };
      mockArticleTypeService.create.mockResolvedValue(expectedType);

      const result = await controller.create(createDto);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('创建成功');
      expect(result.data).toEqual(expectedType);
      expect(mockArticleTypeService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update article type', async () => {
      const updateDto = { name: '技术更新' };
      const expectedType = { id: 1, name: '技术更新' };
      mockArticleTypeService.update.mockResolvedValue(expectedType);

      const result = await controller.update('1', updateDto);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('更新成功');
      expect(result.data).toEqual(expectedType);
      expect(mockArticleTypeService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove article type', async () => {
      mockArticleTypeService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('删除成功');
      expect(mockArticleTypeService.remove).toHaveBeenCalledWith(1);
    });
  });
});
