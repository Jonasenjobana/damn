# TypeORM Migration 功能计划

## 目标
为当前 NestJS 项目添加 TypeORM Migration 功能，实现数据库版本管理和迁移。

## 当前状态
- 数据库：better-sqlite3
- ORM：TypeORM 0.3.28
- 配置：`synchronize: true`（自动同步，禁用）
- 无 migration 配置

## 实现步骤

### 1. 创建 TypeORM 配置文件
创建 `typeorm.config.ts` 配置 DataSource：
```typescript
import { DataSource } from 'typeorm';
import { User } from './src/modules/user/entities/user.entity';
import { Article } from './src/modules/article/entities/article.entity';
import { ArticleType } from './src/modules/article/entities/article-type.entity';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'damn.db',
  entities: [User, Article, ArticleType],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
```

### 2. 添加 Migration 命令到 package.json
```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/typeorm.config.ts",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run -d src/typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/typeorm.config.ts",
    "migration:show": "npm run typeorm -- migration:show -d src/typeorm.config.ts"
  }
}
```

### 3. 创建迁移目录
创建 `src/migrations/` 目录用于存放迁移文件

### 4. 禁用 synchronize（重要）
修改 `app.module.ts`：
- 将 `synchronize: true` 改为 `synchronize: false`
- 使用 migration 替代自动同步

### 5. 创建初始迁移文件
手动创建初始迁移文件，包含所有现有表结构：
- User 表
- Article 表
- ArticleType 表

### 6. 创建迁移工具类（可选）
创建 `src/database/database.service.ts` 提供迁移相关功能

## 文件结构
```
damn/
├── src/
│   ├── migrations/           # 迁移文件目录
│   │   └── 1700000000000-InitialSchema.ts
│   ├── typeorm.config.ts    # TypeORM 配置
│   └── app.module.ts         # 更新配置
└── package.json              # 添加命令
```

## Migration 命令说明

| 命令 | 说明 |
|------|------|
| `pnpm migration:generate <name>` | 根据实体变更自动生成迁移 |
| `pnpm migration:create <name>` | 创建空迁移文件 |
| `pnpm migration:run` | 运行所有未执行的迁移 |
| `pnpm migration:revert` | 回滚上一个迁移 |
| `pnpm migration:show` | 显示迁移状态 |

## 注意事项
1. **禁用 synchronize** - 生产环境必须禁用，使用 migration
2. **开发环境** - 可保持 synchronize: true 用于快速开发
3. **数据库备份** - 运行迁移前建议备份数据
4. **测试迁移** - 始终在测试环境先测试迁移脚本

## 环境区分建议
```typescript
TypeOrmModule.forRoot({
  ...
  synchronize: process.env.NODE_ENV !== 'production',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: process.env.NODE_ENV === 'production',
})
```
