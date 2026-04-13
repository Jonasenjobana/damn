# LLM 聊天 Demo 实施计划

## 📋 需求概述
- 创建新分支 `llm-demo`
- 后端接入 LLM API（OpenAI 或其他）
- 前端支持流式传输响应
- 后端管理多个聊天窗口，每个窗口对话上下文独立
- 前端聊天窗口放在 Admin 后台左侧菜单
- 左侧显示历史聊天列表，可切换不同对话

---

## 🏗️ 技术架构

### 后端（NestJS）
1. **实体设计**：
   - `Conversation` 实体 - 聊天会话（多个对话）
   - `Message` 实体 - 单条消息

2. **核心功能**：
   - 管理多个会话
   - 每个会话维护独立对话上下文
   - 调用 LLM API
   - 支持流式响应（SSE 或 chunked response）
   - 保存所有对话记录到数据库

3. **API 接口**：
   - 获取会话列表
   - 创建新会话
   - 删除会话
   - 获取会话消息列表
   - 发送消息并流式返回响应

### 前端（Vue 3）
1. **页面结构**：
   - 左侧：会话列表（可切换、新建、删除）
   - 右侧：聊天窗口（消息列表、输入框）

2. **核心功能**：
   - 流式接收后端响应
   - 打字机效果显示
   - 支持 Markdown 渲染和代码高亮
   - 滚动自动到底部

---

## 📝 具体实施步骤

### 阶段一：后端开发

#### 步骤 1：创建数据库实体
1. 创建 `Conversation` 实体 `g:\run\damn\damn\src\modules\llm\entities\conversation.entity.ts`
   - id
   - title（对话标题，自动生成或用户编辑）
   - userId（关联用户）
   - modelName（使用的模型）
   - createTime
   - updateTime

2. 创建 `Message` 实体 `g:\run\damn\damn\src\modules\llm\entities\message.entity.ts`
   - id
   - conversationId（关联会话）
   - role（user / assistant / system）
   - content（消息内容）
   - tokens（消耗的 token 数，可选）
   - createTime

#### 步骤 2：创建配置和服务
1. 创建 LLM 配置 `g:\run\damn\damn\src\modules\llm\config\llm.config.ts`
   - API Key 配置
   - 模型选择（OpenAI / Claude / 其他）
   - 基础 URL 配置
   - 最大上下文长度配置

2. 创建 LLM 服务 `g:\run\damn\damn\src\modules\llm\llm.service.ts`
   - 会话 CRUD
   - 消息保存
   - 调用 LLM API
   - 构建对话上下文
   - 流式响应处理

#### 步骤 3：创建 Controller
1. 创建 `g:\run\damn\damn\src\modules\llm\llm.controller.ts`
   - GET `/api/llm/conversations` - 获取会话列表
   - POST `/api/llm/conversations` - 创建新会话
   - DELETE `/api/llm/conversations/:id` - 删除会话
   - GET `/api/llm/conversations/:id/messages` - 获取会话消息
   - POST `/api/llm/conversations/:id/chat` - 发送消息，流式返回响应

#### 步骤 4：创建 Module
1. 创建 `g:\run\damn\damn\src\modules\llm\llm.module.ts`
2. 注册到 AppModule

#### 步骤 5：实现流式响应
- 使用 NestJS 流式响应（Observable）
- 或使用 SSE（Server-Sent Events）

---

### 阶段二：前端开发

#### 步骤 1：创建 API 类型和接口
1. 创建类型 `g:\run\damn\damn-frontend\src\types\llm.ts`
   - Conversation 接口
   - Message 接口

2. 创建 API `g:\run\damn\damn-frontend\src\api\modules\llm.ts`
   - 获取会话列表
   - 创建会话
   - 删除会话
   - 获取消息列表
   - 发送消息（流式）

#### 步骤 2：创建 Store
1. 创建 `g:\run\damn\damn-frontend\src\stores\modules\llm.ts`
   - 管理会话列表
   - 管理当前会话
   - 管理消息列表

#### 步骤 3：创建聊天页面组件
1. 创建 `g:\run\damn\damn-frontend\src\views\admin\LLMChat.vue`
   - 布局：左侧会话列表 + 右侧聊天窗口
   - 左侧：会话列表，新建按钮，删除按钮
   - 右侧：消息列表，输入框，发送按钮

#### 步骤 4：实现流式接收和显示
- 使用 EventSource 或 fetch API 流式读取
- 逐字显示打字机效果
- 自动滚动到底部

#### 步骤 5：添加 Markdown 渲染和代码高亮
- 使用 marked 渲染 Markdown
- 代码高亮（可选，用 highlight.js）

#### 步骤 6：添加菜单路由
1. 在路由 `g:\run\damn\damn-frontend\src\router\index.ts` 添加 LLM 聊天路由
2. 在 AdminLayout.vue 左侧菜单添加"AI 聊天"入口

---

### 阶段三：测试和优化

#### 步骤 1：测试功能
- 创建多个会话，切换会话，确认上下文独立
- 测试流式响应是否正常
- 测试对话历史是否正确保存
- 测试删除会话

#### 步骤 2：优化体验
- 添加加载状态
- 添加错误处理
- 自动生成会话标题（第一条消息截取）
- 滚动自动到底部

---

## 🗄️ 文件结构

```
后端：
src/modules/llm/
├── entities/
│   ├── conversation.entity.ts
│   └── message.entity.ts
├── config/
│   └── llm.config.ts
├── llm.module.ts
├── llm.service.ts
└── llm.controller.ts

前端：
src/
├── types/
│   └── llm.ts
├── api/modules/
│   └── llm.ts
├── stores/modules/
│   └── llm.ts
└── views/admin/
    └── LLMChat.vue
```

---

## 🔑 关键技术点

### 后端流式响应
```typescript
// 使用 NestJS Observable 流式返回
@Post(':id/chat')
chat(@Param('id') id: number, @Body() body: ChatRequest, @Res() res: Response) {
  // 逐块发送 response.write()
}
```

### 前端流式接收
```typescript
// 使用 fetch 读取流
const response = await fetch(url, { method: 'POST', body: data });
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 处理 chunk
}
```

### 上下文管理
- 每个 Conversation 独立保存所有 Message
- 请求 LLM 时，将当前 Conversation 的所有消息按顺序作为上下文发送
- 系统提示词可以固定配置

---

## ⚠️ 需要注意

1. **Token 消耗**：每个会话的上下文越长，Token 消耗越多，建议设置最大消息数限制
2. **API Key**：需要配置环境变量，不要硬编码到代码中
3. **错误处理**：LLM API 可能不稳定，需要做好重试和错误提示
4. **分支**：所有开发在 `llm-demo` 分支进行，稳定后再合并到主分支

---

## ✅ 验收标准

- [ ] 可以创建多个独立的聊天会话
- [ ] 切换会话时，消息历史正确加载，上下文独立
- [ ] 可以删除会话
- [ ] 发送消息后，后端流式返回，前端逐字显示
- [ ] 支持 Markdown 渲染
- [ ] 聊天页面在 Admin 后台菜单可访问
- [ ] 所有对话历史保存到数据库

喵~ 计划完成啦！
