# 适配 OpenAI 接口协议实施计划

## 📋 需求概述
当前代码已经可以兼容 OpenAI 接口协议，但是需要确认：
1. 请求体格式是否符合 OpenAI 规范
2. 响应流式传输格式是否正确
3. 支持不同提供商（OpenAI / Anthropic / 火山方舟 / 字节跳动豆包 等）

现在需要调整代码，严格遵循 OpenAI 接口协议规范，保证兼容性。

---

## 🔍 当前代码分析

### 当前请求格式 (`llm.service.ts`)
```typescript
const response = await fetch(`${baseURL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: this.config.model,
    messages: messages,
    stream: true,
    temperature: this.config.temperature,
    max_tokens: this.config.maxTokens,
  }),
});
```

这已经是 **标准 OpenAI 格式** ✅

### 当前响应处理
代码逐行解析 SSE 流，提取 `delta.content` 兼容 OpenAI 格式 ✅

---

## 🛠️ 需要调整的内容

### 1. 改进配置结构
- 在 `llm.config.ts` 中添加提供商选择
- 支持 `openai` / `anthropic` 两种协议格式

### 2. 请求体适配
- 根据提供商自动切换请求体格式
- OpenAI: `{ model, messages, stream, temperature, max_tokens }` ✓
- Anthropic: `{ model, messages, stream, temperature, max_tokens, anthropic_version }` ✓

### 3. 响应解析适配
- 根据提供商解析不同的响应格式
- OpenAI: `choices[0].delta.content` ✓
- Anthropic: `delta.text` ✓

### 4. 保持流式输出不变
- 仍然使用 SSE 流式输出
- 保持 `{ chunk: string, done: boolean }` 格式返回给前端
- 前端不需要修改

---

## 📝 具体实施步骤

### 步骤 1：修改 llm.config.ts
- 添加 `LLMProvider` 枚举类型
- 修改 `LLMConfig` 接口添加 `provider` 字段
- `getDefaultLLMConfig` 从环境变量读取 `LLM_PROVIDER`

### 步骤 2：修改 llm.service.ts
- 修改 `callLLMStream` 方法
- 根据 provider 选择不同的请求格式
- 根据 provider 解析不同的响应 chunk
- 保持 SSE 流式输出不变

### 步骤 3：验证流式输出格式
- 确认 `data: { chunk: string, done: boolean }\n\n` 格式正确
- 前端已经可以正确处理

---

## 🎯 最终效果
- 环境变量配置 `LLM_PROVIDER=openai` 或 `LLM_PROVIDER=anthropic`
- 后端自动适配对应协议
- 前端不需要任何修改，继续使用原来的流式接收代码
- 支持兼容不同 LLM 提供商

---

## 🔑 环境变量配置
```bash
# LLM 提供商: openai / anthropic
LLM_PROVIDER=openai
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
LLM_MAX_CONTEXT_MESSAGES=20
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
```
