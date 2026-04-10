import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ArticleController', () => {
  let controller: ArticleController;
  let articleService: ArticleService;

  const mockArticleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    togglePin: jest.fn(),
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
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ArticleController>(ArticleController);
    articleService = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return article list with pinned first', async () => {
      const expectedArticles = [
        { id: 1, title: '置顶文章', is_pinned: 1 },
        { id: 2, title: '普通文章', is_pinned: 0 },
      ];
      mockArticleService.findAll.mockResolvedValue(expectedArticles);

      const result = await controller.list();

      expect(result.rlt).toBe('0');
      expect(result.data).toEqual(expectedArticles);
      expect(mockArticleService.findAll).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('should return article detail', async () => {
      const expectedArticle = { id: 1, title: '测试文章' };
      mockArticleService.findOne.mockResolvedValue(expectedArticle);

      const result = await controller.getOne('1');

      expect(result.rlt).toBe('0');
      expect(result.data).toEqual(expectedArticle);
      expect(mockArticleService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create article', async () => {
      const createDto = {
        title: '测试文章',
        content: '## 测试内容',
        article_type_id: 1,
      };
      const expectedArticle = { id: 1, ...createDto };
      mockArticleService.create.mockResolvedValue(expectedArticle);

      const result = await controller.create(createDto);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('创建成功');
      expect(result.data).toEqual(expectedArticle);
      expect(mockArticleService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update article', async () => {
      const updateDto = { title: '更新标题' };
      const expectedArticle = { id: 1, title: '更新标题' };
      mockArticleService.update.mockResolvedValue(expectedArticle);

      const result = await controller.update('1', updateDto);

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('更新成功');
      expect(result.data).toEqual(expectedArticle);
      expect(mockArticleService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove article', async () => {
      mockArticleService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('删除成功');
      expect(mockArticleService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('togglePin', () => {
    it('should pin article', async () => {
      const expectedArticle = { id: 1, title: '测试文章', is_pinned: 1 };
      mockArticleService.togglePin.mockResolvedValue(expectedArticle);

      const result = await controller.togglePin('1');

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('置顶成功');
      expect(result.data).toEqual(expectedArticle);
      expect(mockArticleService.togglePin).toHaveBeenCalledWith(1);
    });

    it('should unpin article', async () => {
      const expectedArticle = { id: 1, title: '测试文章', is_pinned: 0 };
      mockArticleService.togglePin.mockResolvedValue(expectedArticle);

      const result = await controller.togglePin('1');

      expect(result.rlt).toBe('0');
      expect(result.msg).toBe('取消置顶成功');
      expect(result.data).toEqual(expectedArticle);
    });
  });
});
