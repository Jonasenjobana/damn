# Article 相关测试计划

## 测试目标
1. 测试文章类型的 CRUD 功能
2. 测试文章的 CRUD 功能
3. 测试文章置顶功能
4. 测试文章列表排序（置顶优先）
5. 测试 JWT 认证保护
6. 测试 DTO 校验
7. 端到端完整流程测试

## 测试文件结构
```
src/
└── modules/
    └── article/
        ├── article-type.controller.spec.ts  # 文章类型单元测试
        └── article.controller.spec.ts        # 文章单元测试
test/
└── article.e2e-spec.ts                      # 文章端到端测试
```

## 测试内容

### 1. ArticleTypeController 单元测试
- 测试 list 接口返回类型列表
- 测试 create 接口创建类型（需要认证）
- 测试 update 接口更新类型（需要认证）
- 测试 delete 接口删除类型（需要认证）
- 测试未认证时访问受保护接口返回 401

### 2. ArticleController 单元测试
- 测试 list 接口返回文章列表
- 测试 getOne 接口返回文章详情
- 测试 create 接口创建文章（需要认证）
- 测试 update 接口更新文章（需要认证）
- 测试 delete 接口删除文章（需要认证）
- 测试 togglePin 接口置顶/取消置顶（需要认证）
- 测试未认证时访问受保护接口返回 401

### 3. Article 端到端测试
- 完整流程：
  1. 登录获取 token
  2. 创建文章类型
  3. 创建文章
  4. 获取文章列表（验证置顶排序）
  5. 置顶文章
  6. 更新文章
  7. 删除文章
  8. 删除文章类型
- 测试 DTO 校验（缺少必填字段返回错误）
- 测试未认证访问受保护接口

## 实现步骤

1. 创建 article-type.controller.spec.ts
2. 创建 article.controller.spec.ts
3. 创建 article.e2e-spec.ts

## 注意事项
- 所有测试使用统一响应格式 { rlt, msg, data }
- Mock Service 层，不依赖真实数据库
- 覆盖认证和未认证场景
- 覆盖成功和失败场景
