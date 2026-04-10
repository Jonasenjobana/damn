# Swagger API 文档计划

## 目标
为所有接口添加 Swagger API 文档，方便前端开发和 API 测试。

## 完成进度

### ✅ 已完成

#### 1. 安装 Swagger 依赖
- `@nestjs/swagger` 已安装在 package.json

#### 2. 配置 Swagger
- [main.ts](file:///g:/run/damn/damn/src/main.ts) 已配置 Swagger
- 访问地址：`http://localhost:3000/api-docs`

#### 3. Auth 模块 ✅
- `POST /api/auth/login` - 用户登录
- Controller: [auth.controller.ts](file:///g:/run/damn/damn/src/modules/auth/auth.controller.ts)
- DTO: [login.dto.ts](file:///g:/run/damn/damn/src/modules/auth/dto/login.dto.ts)

#### 4. User 模块 ✅
- `GET /api/user/list` - 获取用户列表
- `POST /api/user/create` - 创建用户
- `GET /api/user/profile` - 获取个人信息（需认证）
- `GET /api/user/admin` - 获取管理员信息（需认证）
- Controller: [user.controller.ts](file:///g:/run/damn/damn/src/modules/user/user.controller.ts)

#### 5. Article 模块 ✅
- `GET /api/article/list` - 获取文章列表
- `GET /api/article/:id` - 获取文章详情
- `POST /api/article/create` - 创建文章（需认证）
- `PUT /api/article/update/:id` - 更新文章（需认证）
- `DELETE /api/article/delete/:id` - 删除文章（需认证）
- `PUT /api/article/pin/:id` - 置顶/取消置顶（需认证）
- Controller: [article.controller.ts](file:///g:/run/damn/damn/src/modules/article/article.controller.ts)
- DTO: [article.dto.ts](file:///g:/run/damn/damn/src/modules/article/dto/article.dto.ts)

#### 6. Article Type 模块 ✅
- `GET /api/article-type/list` - 获取类型列表
- `POST /api/article-type/create` - 创建类型（需认证）
- `PUT /api/article-type/update/:id` - 更新类型（需认证）
- `DELETE /api/article-type/delete/:id` - 删除类型（需认证）
- Controller: [article-type.controller.ts](file:///g:/run/damn/damn/src/modules/article/article-type.controller.ts)
- DTO: [article-type.dto.ts](file:///g:/run/damn/damn/src/modules/article/dto/article-type.dto.ts)

#### 7. Upload 模块 ✅
- `POST /api/upload/image` - 上传图片（需认证）
- `GET /api/upload/images/:filename` - 获取图片
- `DELETE /api/upload/images/:id` - 删除图片（需认证）
- Controller: [upload.controller.ts](file:///g:/run/damn/damn/src/modules/upload/upload.controller.ts)

#### 8. Stats 模块 ✅
- `GET /api/stats/errors` - 获取报错统计（需认证）
- `GET /api/stats/errors/top` - 获取 Top 报错（需认证）
- `GET /api/stats/errors/clear` - 清空统计（需认证）
- Controller: [stats.controller.ts](file:///g:/run/damn/damn/src/common/stats.controller.ts)
- Service: [error-stats.service.ts](file:///g:/run/damn/damn/src/common/error-stats.service.ts)

## 实现步骤

### 1. 安装 Swagger 依赖
```bash
npm install @nestjs/swagger
```

### 2. 配置 Swagger
在 `main.ts` 中配置 Swagger：
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(3000);
}
```

### 3. 添加 Controller 装饰器

为每个 Controller 添加：
```typescript
@ApiTags('标签名称')
@Controller('路由')
export class XxxController {}
```

### 4. 添加方法装饰器

为每个方法添加：
```typescript
@ApiOperation({ summary: '方法描述' })
@ApiResponse({ status: 200, description: '成功' })
@ApiResponse({ status: 401, description: '未授权' })
@ApiBearerAuth()
@Get('路径')
async method() {}
```

### 5. 添加参数装饰器

为 DTO 添加：
```typescript
export class CreateDto {
  @ApiProperty({ description: '字段描述', example: '示例值' })
  @IsString()
  field: string;
}
```

## 文件结构
```
src/
├── main.ts                          # 添加 Swagger 配置
└── modules/
    ├── auth/
    │   └── auth.controller.ts       # 添加 Swagger 装饰器
    ├── user/
    │   └── user.controller.ts       # 添加 Swagger 装饰器
    ├── article/
    │   ├── article.controller.ts    # 添加 Swagger 装饰器
    │   └── article-type.controller.ts # 添加 Swagger 装饰器
    ├── upload/
    │   └── upload.controller.ts     # 添加 Swagger 装饰器
    └── common/
        └── stats.controller.ts      # 添加 Swagger 装饰器
```

## Swagger 访问地址
启动后访问：`http://localhost:3000/api-docs`

## 注意事项
- 所有接口添加 `ApiTags` 标签分类
- 所有方法添加 `ApiOperation` 描述
- 需要认证的接口添加 `ApiBearerAuth` 或 `ApiCookieAuth`
- DTO 添加 `ApiProperty` 描述字段
- 添加响应状态码描述
