# LLM 意图识别 + 结构化操作实施计划

## 📋 需求概述
让 LLM 不仅仅是聊天，而是能够：
1. **识别用户意图**，并输出结构化 JSON
2. **执行不同任务**，根据意图类型做不同操作
3. **结构化存储数据**，不同意图数据存在不同字段
4. **示例场景**：
   - 账单识别：识别类型、金额、时间、备注 → 存储账单数据
   - 定时提醒：识别时间、内容 → 创建定时任务
   - 生成博客：总结聊天内容 → 自动生成博客文章
   - TODO 任务：识别任务内容、优先级、截止日期 → 创建任务

---

## 🏗️ 架构设计

### 1. 新增实体
- `llm_intents` 表：存储识别后的意图和结构化数据
- 关联到 conversation 和 message

### 2. 核心流程
```
用户发送消息 → 后端调用 LLM → LLM 输出 JSON 格式的意图识别
    ↓
判断是否需要执行操作
    ↓
是 → 执行对应操作 + 存储结构化数据 → 返回操作结果给用户
否 → 正常聊天响应
```

### 3. 系统提示词
给 LLM 的系统提示词要求：
> 如果用户请求可以被识别为可执行任务，请按以下 JSON 格式输出：
> ```json
> {
>   "type": "intent_type",
>   "content": "用户原始请求描述",
>   "data": { /* 结构化数据 */ },
>   "need_action": true
> }
> ```
> 如果只是普通聊天，请输出：
> ```json
> {
>   "type": "chat",
>   "content": "聊天内容",
>   "data": null,
>   "need_action": false
> }
> ```

---

## 📝 具体实施步骤

### 步骤 1：新建 Intent 实体
- 文件：`src/modules/llm/entities/intent.entity.ts`
- 字段：
  - id
  - messageId（关联到 message）
  - conversationId（关联到 conversation）
  - type（意图类型：chat/bill/reminder/blog/todo/custom...）
  - content（原始内容描述）
  - structuredData（JSON 字段，存储结构化数据）
  - executed（是否已执行，boolean）
  - result（执行结果）
  - createTime
  - updateTime

### 步骤 2：修改 llm.service.ts
1. 修改 `callLLMStream` 处理流程
   - 在请求 LLM 前，添加系统提示词说明 JSON 格式要求
   - 收集完整响应后，尝试解析 JSON
   - 如果解析成功且 `need_action: true` → 执行对应操作
   - 执行完成后，返回操作结果给用户

2. 新增 `executeIntent` 方法
   - 根据不同 `type` 分发到不同处理器

### 步骤 3：实现意图处理器
- **账单识别处理器**：存储账单数据到 `llm_intents`
- **定时提醒处理器**：创建定时任务（需要 cron）
- **生成博客处理器**：自动创建一篇博客文章
- **TODO 任务处理器**：创建 TODO 任务（TODO 后续做）
- **普通聊天**：直接返回聊天内容

### 步骤 4：添加 API 接口
- GET `/api/llm/conversations/:id/intents` - 获取会话中的意图列表
- POST `/api/llm/intents/:id/execute` - 手动重新执行（可选）

### 步骤 5：前端适配
- 显示结构化数据展示（比如账单卡片、提醒卡片）
- 显示执行结果
- 保持原有聊天体验不变

---

## 🎯 支持的意图类型

| 类型 | 说明 | 结构化数据 | 执行操作 |
|------|------|----------|----------|
| `chat` | 普通聊天 | `null` | 无，正常聊天 |
| `bill` | 账单识别 | `{ type, amount, date, description }` | 存储结构化数据 |
| `reminder` | 定时提醒 | `{ time, content, repeat }` | 创建定时任务 |
| `blog` | 生成博客 | `{ title, content, tags }` | 创建博客文章 |
| `todo` | TODO 任务 | `{ title, priority, dueDate }` | 创建 TODO 任务 |
| `custom` | 自定义 | `{ ... }` | 存储结构化数据 |

---

## 🔑 关键点设计

### 1. 提示词工程
在原有系统提示词基础上追加：
```
你是一个智能助手，需要识别用户意图。
如果用户请求可以被结构化识别并执行，请严格按照 JSON 格式输出：
{
  "type": "意图类型，可选值: chat|bill|reminder|blog|todo|custom",
  "content": "用户请求的简要描述",
  "data": {
    // 根据类型填写对应字段
  },
  "need_action": true/false
}
如果不确定，或者只是普通聊天，请设置 type: "chat", need_action: false。
```

### 2. JSON 解析容错
- LLM 输出可能带有 markdown 代码块 ```json ... ```，需要先提取
- 解析失败则回退到普通聊天

### 3. 数据存储
- 所有识别出的意图都存储在 `llm_intents` 表
- 结构化数据用 JSON 字段存储，灵活扩展

---

## 📊 文件清单

**新增文件：**
- `src/modules/llm/entities/intent.entity.ts` - 意图实体
- `src/modules/llm/processors/intent-processor.ts` - 意图处理器抽象
- `src/modules/llm/processors/bill.processor.ts` - 账单处理器
- `src/modules/llm/processors/reminder.processor.ts` - 提醒处理器
- `src/modules/llm/processors/blog.processor.ts` - 博客生成处理器

**修改文件：**
- `src/modules/llm/llm.module.ts` - 注册实体
- `src/modules/llm/llm.service.ts` - 修改流式处理流程，添加意图识别
- `src/modules/llm/llm.controller.ts` - 新增意图相关接口

---

## ✅ 验收标准
1. 用户发送自然语言请求，LLM 能正确识别意图
2. 识别出可执行意图后，自动执行对应操作并存储结构化数据
3. 操作结果返回给用户，前端正常显示
4. 普通聊天不受影响，仍然可以正常流式输出
5. 账单、提醒、生成博客三个示例场景能正常工作
