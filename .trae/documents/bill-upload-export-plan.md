# 账单导入上传功能实现计划

## 需求分析
现有功能已经可以通过AI识别账单截图并自动解析生成结构化账单数据，存储在数据库中。现在需要增加**手动导入账单JSON文件**的功能，用户上传JSON文件后，系统解析文件内容并批量创建账单记录，前端展示。

## 现有架构分析
- 后端：`Bill` 实体已经存在，`LLMService` 已经有保存账单的逻辑 `saveBills()`
- 前端：`LLMChat` 页面已经有 `BillCard` 组件展示账单，按消息分组展示
- 数据库：`llm_bills` 表结构已经存在

## 实现步骤

### 后端部分
1. **修改 Bill 实体** - 添加 `original_file` 字段记录原始文件名
   - 新增字段 `originalName` (varchar 255) 可选，记录上传的原始文件名
   - 遵循数据库规范：小写下划线命名 `original_file`

2. **新增 DTO** - CreateBillsFromFileDto
   - `conversationId: number` - 对话ID
   - 接收文件上传，使用 `@UploadedFile()` 装饰器

3. **新增 Controller 接口** - 在 `LLMController` 新增：
   - `POST /llm/conversations/:id/bills/upload` - 上传JSON文件导入账单
   - 添加 Swagger 注解
   - 遵循 RESTful 格式返回

4. **新增 Service 方法** - 在 `LLMService` 新增：
   - `createBillsFromFile()` - 解析JSON文件内容，遍历数组批量保存账单
   - JSON格式要求：`{ "data": [...] }` 与AI识别返回格式一致

### 前端部分
5. **在 LLMChat.vue 添加文件上传按钮**
   - 只在 `bill` 类型对话显示上传按钮
   - 使用 `el-upload` 组件
   - 限制只接受 `.json` 文件
   - 文件大小限制（建议 5MB 以内）

6. **处理上传成功回调**
   - 上传成功后重新加载账单列表
   - 显示成功提示信息

7. **样式调整**
   - 上传按钮区域布局整理，保持界面整洁
   - 上传成功后自动刷新账单展示

### 测试验证
8. **功能验证**
   - 验证JSON文件格式解析
   - 验证批量创建账单入库
   - 验证前端正确展示新上传的账单

## 文件修改清单
- 后端：`src/modules/llm/entities/bill.entity.ts` - 添加字段
- 后端：`src/modules/llm/llm.controller.ts` - 添加接口
- 后端：`src/modules/llm/llm.service.ts` - 添加导入方法
- 前端：`src/views/admin/LLMChat.vue` - 添加上传UI和处理逻辑
