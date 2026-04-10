# 前端项目开发规范

## Why
根据后端 API 接口文档构建完整的前端博客系统，包含前台用户浏览页面和后台管理系统。需要使用 Element Plus、Axios、ECharts 和富文本编辑器，并实现前后端完全联调。

## What Changes
- 安装并配置 Element Plus、Axios、ECharts、@toast-ui/editor
- 创建前后台路由结构和页面组件
- 实现登录鉴权功能（Cookie 认证）
- 前台：首页（文章列表）、文章详情页（支持点赞、浏览时长上报）
- 后台：Dashboard（统计图表）、博客管理（CRUD）、文章类型管理（CRUD）
- 封装通用 API 服务和状态管理

## Impact
- 新增依赖：element-plus, axios, echarts, @toast-ui/editor
- 新增页面：Home, ArticleDetail, Login, Dashboard, ArticleManage, ArticleTypeManage
- 新增模块：stores/auth, stores/article, stores/articleType
- 新增路由：前台路由、后台路由（需登录保护）

## ADDED Requirements

### Requirement: 项目初始化和依赖安装
系统 SHALL 使用 Vue 3 + TypeScript + Vite 构建项目

#### Scenario: 安装依赖
- **WHEN** 项目初始化
- **THEN** 安装 Element Plus, Axios, ECharts, @toast-ui/editor, @toast-ui/editor 插件

### Requirement: 前台页面 - 首页
系统 SHALL 提供文章列表首页

#### Scenario: 首页文章列表
- **WHEN** 用户访问首页
- **THEN** 展示文章列表，包含标题、封面、摘要、类型、浏览数、点赞数
- **AND** 支持按类型筛选文章
- **AND** 支持分页

### Requirement: 前台页面 - 文章详情
系统 SHALL 提供文章详情页

#### Scenario: 文章详情页
- **WHEN** 用户点击文章
- **THEN** 展示完整文章内容（Markdown 渲染）
- **AND** 自动增加浏览次数
- **AND** 展示点赞按钮（可切换状态）
- **AND** 每 30 秒自动上报浏览时长

### Requirement: 后台页面 - 登录
系统 SHALL 提供管理员登录功能

#### Scenario: 管理员登录
- **WHEN** 管理员输入用户名密码
- **THEN** 调用登录 API，保存 Cookie
- **AND** 登录成功后跳转 Dashboard

### Requirement: 后台页面 - Dashboard
系统 SHALL 提供数据统计仪表盘

#### Scenario: Dashboard 展示
- **WHEN** 管理员登录后访问 Dashboard
- **THEN** 使用 ECharts 展示文章统计图表
- **AND** 展示总浏览量、总点赞数、总文章数
- **AND** 展示最近错误统计

### Requirement: 后台页面 - 博客管理
系统 SHALL 提供文章 CRUD 管理

#### Scenario: 文章管理
- **WHEN** 管理员访问博客管理
- **THEN** 展示文章列表，支持分页
- **AND** 提供创建文章功能（富文本编辑器）
- **AND** 提供编辑、删除、置顶功能
- **AND** 支持上传封面图片

### Requirement: 后台页面 - 文章类型管理
系统 SHALL 提供文章类型 CRUD 管理

#### Scenario: 类型管理
- **WHEN** 管理员访问文章类型管理
- **THEN** 展示类型列表
- **AND** 提供创建、编辑、删除类型功能

### Requirement: API 服务封装
系统 SHALL 封装通用的 API 服务

#### Scenario: Axios 封装
- **WHEN** 调用 API
- **THEN** 使用 Axios 统一处理请求
- **AND** 自动处理 Cookie 认证
- **AND** 统一处理响应格式（rlt, msg, data）
- **AND** 统一处理错误

### Requirement: 状态管理
系统 SHALL 使用 Pinia 管理状态

#### Scenario: 状态管理模块
- **WHEN** 管理用户状态
- **THEN** 创建 auth store（登录状态、用户信息）
- **WHEN** 管理文章状态
- **THEN** 创建 article store（文章列表、详情）
- **WHEN** 管理类型状态
- **THEN** 创建 articleType store（类型列表）

### Requirement: 路由守卫
系统 SHALL 实现路由权限控制

#### Scenario: 路由守卫
- **WHEN** 用户访问需要登录的页面
- **THEN** 检查是否已登录
- **AND** 未登录则跳转到登录页

## MODIFIED Requirements
无

## REMOVED Requirements
无

## 技术栈
- Vue 3 + TypeScript
- Vite
- Element Plus（UI 组件库）
- Axios（HTTP 请求）
- ECharts（图表）
- @toast-ui/editor（富文本编辑器，支持 Markdown）
- Pinia（状态管理）
- Vue Router（路由）
- API 文档：damn-frontend/API接口文档.md
