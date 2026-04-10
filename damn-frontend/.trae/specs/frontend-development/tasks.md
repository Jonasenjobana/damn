# Tasks

- [ ] Task 1: 项目初始化和依赖安装
  - [ ] SubTask 1.1: 安装 Element Plus, Axios, ECharts, @toast-ui/editor 等依赖
  - [ ] SubTask 1.2: 配置 Vite 支持 Element Plus 自动导入
  - [ ] SubTask 1.3: 配置 main.ts 引入 Element Plus
  - [ ] SubTask 1.4: 配置 vue-router 和 Pinia

- [ ] Task 2: 创建项目目录结构
  - [ ] SubTask 2.1: 创建 views 目录（页面组件）
  - [ ] SubTask 2.2: 创建 components 目录（通用组件）
  - [ ] SubTask 2.3: 创建 api 目录（API 服务）
  - [ ] SubTask 2.4: 创建 stores 目录（状态管理）
  - [ ] SubTask 2.5: 创建 router 目录（路由配置）

- [ ] Task 3: 封装 Axios API 服务
  - [ ] SubTask 3.1: 创建 axios 实例，配置 baseURL 和超时
  - [ ] SubTask 3.2: 添加请求拦截器处理 Cookie
  - [ ] SubTask 3.3: 添加响应拦截器处理统一响应格式
  - [ ] SubTask 3.4: 创建 API 模块（auth, article, articleType, upload, stats）
  - [ ] SubTask 3.5: 创建 types 目录定义 TypeScript 接口

- [ ] Task 4: 创建 Pinia Stores
  - [ ] SubTask 4.1: 创建 auth store（登录状态、用户信息）
  - [ ] SubTask 4.2: 创建 article store（文章列表、详情）
  - [ ] SubTask 4.3: 创建 articleType store（类型列表）
  - [ ] SubTask 4.4: 创建 ui store（Loading、Message 等）

- [ ] Task 5: 配置路由和路由守卫
  - [ ] SubTask 5.1: 创建前台路由（Home, ArticleDetail, Layout）
  - [ ] SubTask 5.2: 创建后台路由（Login, Dashboard, ArticleManage, ArticleTypeManage, AdminLayout）
  - [ ] SubTask 5.3: 实现路由守卫检查登录状态
  - [ ] SubTask 5.4: 配置路由懒加载

- [ ] Task 6: 前台页面 - 首页（Home）
  - [ ] SubTask 6.1: 创建 Home 页面布局
  - [ ] SubTask 6.2: 实现文章列表组件
  - [ ] SubTask 6.3: 实现文章卡片组件
  - [ ] SubTask 6.4: 实现文章类型筛选
  - [ ] SubTask 6.5: 实现分页功能

- [ ] Task 7: 前台页面 - 文章详情（ArticleDetail）
  - [ ] SubTask 7.1: 创建文章详情页面
  - [ ] SubTask 7.2: 集成 Markdown 渲染组件
  - [ ] SubTask 7.3: 实现点赞功能
  - [ ] SubTask 7.4: 实现浏览时长上报（定时器）
  - [ ] SubTask 7.5: 展示文章统计信息

- [ ] Task 8: 后台页面 - 登录（Login）
  - [ ] SubTask 8.1: 创建登录表单
  - [ ] SubTask 8.2: 实现登录验证
  - [ ] SubTask 8.3: 调用登录 API
  - [ ] SubTask 8.4: 登录成功后跳转 Dashboard

- [ ] Task 9: 后台页面 - Dashboard
  - [ ] SubTask 9.1: 创建 Dashboard 布局
  - [ ] SubTask 9.2: 使用 ECharts 展示文章统计图表
  - [ ] SubTask 9.3: 展示关键数据指标卡片
  - [ ] SubTask 9.4: 获取并展示错误统计

- [ ] Task 10: 后台页面 - 博客管理（ArticleManage）
  - [ ] SubTask 10.1: 创建文章列表表格
  - [ ] SubTask 10.2: 实现创建文章对话框
  - [ ] SubTask 10.3: 集成富文本编辑器
  - [ ] SubTask 10.4: 实现封面图片上传
  - [ ] SubTask 10.5: 实现编辑、删除、置顶功能

- [ ] Task 11: 后台页面 - 文章类型管理（ArticleTypeManage）
  - [ ] SubTask 11.1: 创建类型列表
  - [ ] SubTask 11.2: 实现创建/编辑类型对话框
  - [ ] SubTask 11.3: 实现删除类型功能

- [ ] Task 12: 前后端联调测试
  - [ ] SubTask 12.1: 配置 Vite 代理解决跨域
  - [ ] SubTask 12.2: 测试登录功能
  - [ ] SubTask 12.3: 测试文章 CRUD 功能
  - [ ] SubTask 12.4: 测试类型管理功能
  - [ ] SubTask 12.5: 测试前台页面功能
  - [ ] SubTask 12.6: 测试统计和图表功能

# Task Dependencies
- Task 1 必须在所有任务之前完成
- Task 2 在 Task 1 完成后进行
- Task 3, 4, 5 可以并行进行（在 Task 2 完成后）
- Task 6, 7 依赖于 Task 3, 4, 5
- Task 8, 9, 10, 11 依赖于 Task 3, 4, 5
- Task 12 在所有页面完成后进行
