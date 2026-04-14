# LLM 账单识别功能实施计划

## 📋 需求概述
- 创建新对话前，前端弹出类型选择：**聊天** 或 **账单**
- **聊天类型**：原有普通聊天功能，不变
- **账单类型**：允许用户上传图片 + 文字补充，后端用 LLM 识别账单，返回结构化 JSON 存储
- LLM 系统提示词：专门针对账单识别优化，要求返回特定 JSON 格式

---

## 🏗️ 架构设计

### 1. 数据库修改
- Conversation 实体新增 `conversationType` 字段：`chat` | `bill`
- 新增 `llm_bills` 表：存储识别后的账单结构化数据
  - id
  - conversationId（关联对话）
  - messageId（关联消息）
  - type（账单分类：水果、餐饮、购物、交通、住宿、娱乐、医疗、其他）
  - date（账单日期）
  - items（明细 JSON：[{name, price}]）
  - total（总金额）
  - from（支付渠道：支付宝、微信、现金、银行卡、其他）
  - createTime
  - updateTime

### 2. 流程设计
```
前端 → 用户点击新建对话 → 弹出类型选择 [聊天 | 账单]
    ↓
用户选择账单类型 → 允许上传图片 + 输入补充文字
    ↓
发送给后端 → Conversation 创建时设置 type = bill
    ↓
后端调用 LLM 前，添加专用系统提示词：
"你是一个专业账单图片分析师，能够识别账单类型、金额。如果用户发送与其无关，请忽略。
返回格式要求 json。type 是记账软件中常见的类型划分，from 是支付渠道，如果不知则为其他。
date 如果不清楚按照服务器时间。请严格返回 json 格式。
如果成功返回：
{
  "msg": "success",
  "rlt": 0,
  "data": [{
    "type": "水果",
    "date": "2020-04-12 13:04:22",
    "name": "榴莲",
    "price": 87.4,
    "from": "支付宝"
  }]
}
如果失败返回：
{
  "msg": "识别异常",
  "rlt": 1
}"
    ↓
LLM 返回 JSON → 后端解析 → 存储到 llm_bills 表
    ↓
返回识别结果给前端 → 前端展示结构化账单
```

---

## 📝 具体实施步骤

### 后端步骤

#### 步骤 1：修改 Conversation 实体
- 新增 `conversationType` 字段：`chat` | `bill`，默认 `chat`

#### 步骤 2：新增 Bill 实体
- 创建 `src/modules/llm/entities/bill.entity.ts`
- 按上述设计添加字段

#### 步骤 3：修改 LLMModule
- 注册 Bill 实体到 TypeORM

#### 步骤 4：修改 LLMService
- 修改 `createConversation` 方法，接收 `conversationType` 参数
- 修改 `streamChat` / `callLLMStream` 处理流程
  - 如果是 `bill` 类型对话，使用**专用系统提示词**
  - 识别完成后，解析 JSON 并存储到 `llm_bills` 表
  - 返回识别结果给前端显示

#### 步骤 5：新增 API 接口
- GET `/api/llm/conversations/:id/bills` - 获取对话下的账单列表
- DELETE `/api/llm/bills/:id` - 删除账单

### 前端步骤

#### 步骤 1：修改类型定义
- `src/types/llm.ts` 新增 `ConversationType` 类型
- `Conversation` 接口新增 `conversationType` 字段
- 新增 `BillItem` / `Bill` 接口

#### 步骤 2：修改 Store
- `createConversation` 新增 `conversationType` 参数
- 新增 `getBills` 方法

#### 步骤 3：修改 LLMChat.vue
- 点击"新建对话" → 弹出类型选择对话框
- 账单类型：显示图片上传组件
- 识别成功后，在聊天列表中展示结构化账单卡片
- 普通聊天保持原有样式不变

#### 步骤 4：添加账单卡片组件
- 创建 `components/BillCard.vue` 组件
- 展示账单明细：类型、日期、项目、价格、支付渠道
- 样式美化

---

## 🎯 功能特性

| 功能 | 聊天对话 | 账单识别 |
|------|----------|----------|
| 新建对话框 | ✅ 选择类型 | ✅ 选择类型 |
| 图片上传 | ❌ | ✅ 支持 |
| 专用系统提示词 | ❌ | ✅ 账单识别专用 |
| 结构化存储 | ❌ | ✅ JSON 存储到数据库 |
| 卡片展示 | ❌ | ✅ 结构化展示 |
| 流式响应 | ✅ 支持 | ✅ 支持 |

---

## 🔑 系统提示词（最终版）
```
你是一个专业账单图片分析师，能够识别账单类型、金额。如果用户发送与其无关，请忽略。
返回格式要求 json。type 是记账软件中常见的类型划分，from 是支付渠道，如果不知则为其他。
date 如果不清楚按照服务器当前时间。请严格返回 json 格式。

如果成功识别返回格式：
{
  "msg": "success",
  "rlt": 0,
  "data": [{
    "type": "水果",
    "date": "2020-04-12 13:04:22",
    "name": "榴莲",
    "price": 87.4,
    "from": "支付宝"
  }]
}

如果识别失败返回格式：
{
  "msg": "识别异常",
  "rlt": 1
}
```

---

## 📊 文件清单

**新增文件：**
- 后端：`src/modules/llm/entities/bill.entity.ts` - 账单实体
- 前端：`src/types/llm.ts` - 新增类型定义（修改）
- 前端：`src/components/BillCard.vue` - 账单卡片组件
- 前端：`src/views/admin/LLMChat.vue` - 修改（添加类型选择、图片上传、账单展示）

**修改文件：**
- 后端：`src/modules/llm/entities/conversation.entity.ts` - 新增 conversationType
- 后端：`src/modules/llm/llm.module.ts` - 注册 Bill 实体
- 后端：`src/modules/llm/llm.service.ts` - 修改创建和流式处理逻辑
- 后端：`src/modules/llm/llm.controller.ts` - 新增账单相关接口
- 前端：`src/stores/modules/llm.ts` - 修改 createConversation
- 前端：`src/api/modules/llm.ts` - 新增账单接口

---

## ✅ 验收标准
1. ✅ 新建对话弹出类型选择框（聊天 / 账单）
2. ✅ 账单类型支持上传图片 + 文字补充
3. ✅ 后端使用专用系统提示词调用 LLM
4. ✅ LLM 返回 JSON 格式账单数据
5. ✅ 后端解析 JSON 并存储到 `llm_bills` 表
6. ✅ 前端以卡片形式展示结构化账单
7. ✅ 普通聊天功能保持不变
8. ✅ 流式响应正常工作
