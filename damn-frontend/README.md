# Damn Blog 前端项目

基于 Vue 3 + TypeScript + Element Plus 的博客系统前端。

## 📌 项目信息

- **前端地址**: http://localhost:5173 或 http://<your-ip>:5173（内网访问）
- **后端地址**: http://localhost:3000
- **API 文档**: http://localhost:3000/api-docs

### 内网访问

开发服务器已配置为允许内网访问，通过 `host: '0.0.0.0'` 监听所有网络接口。

在同一局域网内的其他设备可以通过 `http://<本机IP>:5173` 访问前端页面。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

## 📁 项目结构

```
src/
├── api/                    # API 接口模块
│   ├── modules/           # 分模块 API
│   │   ├── article.ts     # 文章接口
│   │   ├── articleType.ts # 文章类型接口
│   │   ├── auth.ts        # 认证接口
│   │   ├── stats.ts       # 统计接口
│   │   ├── upload.ts      # 上传接口
│   │   └── user.ts       # 用户接口
│   └── request.ts         # Axios 实例配置
├── components/            # 公共组件
├── router/               # 路由配置
│   └── index.ts
├── stores/               # Pinia 状态管理
│   └── modules/
│       ├── article.ts     # 文章状态
│       ├── articleType.ts # 文章类型状态
│       ├── auth.ts       # 认证状态
│       └── stats.ts      # 统计状态
├── types/                # TypeScript 类型定义
│   ├── api.ts           # API 响应类型
│   ├── article.ts       # 文章类型
│   ├── articleType.ts   # 文章类型定义
│   ├── user.ts         # 用户类型
│   └── upload.ts       # 上传类型
├── utils/               # 工具函数
└── views/              # 页面视图
    ├── admin/          # 后台管理页面
    │   ├── AdminLayout.vue     # 后台布局
    │   ├── Login.vue           # 登录页
    │   ├── Dashboard.vue       # 仪表盘
    │   ├── ArticleManage.vue   # 文章管理
    │   └── ArticleTypeManage.vue  # 文章类型管理
    └── frontend/       # 前台展示页面
        ├── FrontendLayout.vue   # 前台布局
        ├── Home.vue           # 首页
        └── ArticleDetail.vue  # 文章详情
```

## 🎯 功能模块

### 前台页面

- **首页** (`/`): 展示文章列表，支持置顶、阅读量、点赞数显示
- **文章详情** (`/article/:id`): 文章详情页，支持 Markdown 渲染、点赞、阅读时长统计

### 后台管理

- **仪表盘** (`/admin/dashboard`): 展示数据统计图表（ECharts）
- **文章管理** (`/admin/articles`): 文章 CRUD 操作、置顶、封面上传
- **文章类型管理** (`/admin/article-types`): 文章类型 CRUD 操作

### 认证

- Cookie 认证方式
- 登录状态持久化
- 路由守卫保护

## 🛠 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 超集，提供类型检查
- **Vite** - 新一代前端构建工具
- **Element Plus** - 基于 Vue 3 的组件库
- **Axios** - HTTP 请求库
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue 官方路由管理
- **ECharts** - 数据可视化图表库

## 📝 API 接口

所有 API 接口均通过 `/api` 前缀访问，具体接口请参考 API 接口文档。

### 主要接口

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 认证 | `/api/auth/login` | POST | 用户登录 |
| 文章 | `/api/article/list` | GET | 获取文章列表 |
| 文章 | `/api/article/:id` | GET | 获取文章详情 |
| 文章 | `/api/article/create` | POST | 创建文章 |
| 文章 | `/api/article/update/:id` | PUT | 更新文章 |
| 文章 | `/api/article/delete/:id` | DELETE | 删除文章 |
| 文章 | `/api/article/:id/like` | POST | 点赞/取消点赞 |
| 文章 | `/api/article/:id/stats` | GET | 获取文章统计 |
| 类型 | `/api/article-type/list` | GET | 获取类型列表 |
| 类型 | `/api/article-type/create` | POST | 创建类型 |
| 类型 | `/api/article-type/update/:id` | PUT | 更新类型 |
| 类型 | `/api/article-type/delete/:id` | DELETE | 删除类型 |
| 上传 | `/api/upload/image` | POST | 上传图片 |
| 统计 | `/api/stats/errors` | GET | 获取错误统计 |

## 🔧 开发说明

### 配置文件

- `vite.config.ts`: Vite 配置，包含代理设置、插件配置
- `.env.development`: 开发环境变量
- `.env.production`: 生产环境变量

### 命名规范

- **API 响应字段**: 驼峰命名 (camelCase)
- **API 请求字段**: 下划线命名 (snake_case)
- **组件**: PascalCase 命名
- **文件**: kebab-case 命名

### 状态管理

使用 Pinia 进行状态管理，各模块独立管理：

- `useAuthStore`: 认证状态
- `useArticleStore`: 文章状态
- `useArticleTypeStore`: 文章类型状态
- `useStatsStore`: 统计状态

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [ECharts](https://echarts.apache.org/)
