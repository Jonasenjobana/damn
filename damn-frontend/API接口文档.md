# Damn Blog API 接口文档

## 📌 基础信息

- **API 基础地址**: `http://localhost:3000/api`
- **接口前缀**: 所有接口统一以 `/api` 开头
- **响应格式**: JSON
- **认证方式**: Cookie 认证（登录后自动获取 `access_token` Cookie）
- **Swagger 文档**: `http://localhost:3000/api-docs`

---

## 📋 通用响应格式

### 成功响应
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {}
}
```

### 失败响应
```json
{
  "rlt": "1",
  "msg": "错误信息",
  "data": null
}
```

### 字段说明
- `rlt`: 响应码，`0` 表示成功，`1` 表示失败
- `msg`: 提示信息
- `data`: 返回的数据（驼峰命名）

---

## 🔐 认证模块

### 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "isAdmin": true
    }
  }
}
```

**Cookie 设置**: 登录成功后会自动设置 `access_token` Cookie（有效期 24 小时）

---

## 👤 用户模块

### 获取用户列表

**接口地址**: `GET /api/user/list`

**认证要求**: 无需认证

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "phone": "",
      "status": 1,
      "isAdmin": 1,
      "createTime": "2026-04-09T12:00:00.000Z",
      "updateTime": "2026-04-09T12:00:00.000Z"
    }
  ]
}
```

---

### 创建用户

**接口地址**: `POST /api/user/create`

**认证要求**: 无需认证（建议增加管理员认证）

**请求参数**:
```json
{
  "username": "newuser",
  "password": "password123",
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "创建成功",
  "data": {
    "id": 2,
    "username": "newuser"
  }
}
```

---

### 获取个人信息

**接口地址**: `GET /api/user/profile`

**认证要求**: ✅ 需要登录

**请求头**: 需要携带 Cookie

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "admin"
    },
    "message": "这是受保护的个人信息"
  }
}
```

---

### 获取管理员信息

**接口地址**: `GET /api/user/admin`

**认证要求**: ✅ 需要登录

**请求头**: 需要携带 Cookie

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "admin"
    },
    "isAdmin": true,
    "message": "这是管理员专属信息"
  }
}
```

---

## 📝 文章模块

### 获取文章列表

**接口地址**: `GET /api/article/list`

**认证要求**: 无需认证

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "我的第一篇文章",
      "content": "# 标题\n\n这是文章内容",
      "cover": "https://example.com/cover.jpg",
      "articleTypeId": 1,
      "articleTypeName": "技术博客",
      "sort": 0,
      "isPinned": 1,
      "isPrivate": 0,
      "status": 1,
      "viewCount": 100,
      "likeCount": 10,
      "totalViewDuration": 3600,
      "createTime": "2026-04-09T12:00:00.000Z",
      "updateTime": "2026-04-09T12:00:00.000Z"
    }
  ]
}
```

---

### 获取文章详情

**接口地址**: `GET /api/article/:id`

**认证要求**: 无需认证

**功能说明**: 访问时自动增加浏览次数（同一访客 1 小时内只计数一次）

**路径参数**:
- `id`: 文章 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "id": 1,
    "title": "我的第一篇文章",
    "content": "# 标题\n\n这是文章内容",
    "cover": "https://example.com/cover.jpg",
    "articleTypeId": 1,
    "articleTypeName": "技术博客",
    "sort": 0,
    "isPinned": 1,
    "isPrivate": 0,
    "status": 1,
    "viewCount": 101,
    "likeCount": 10,
    "totalViewDuration": 3600,
    "createTime": "2026-04-09T12:00:00.000Z",
    "updateTime": "2026-04-09T12:00:00.000Z"
  }
}
```

---

### 创建文章

**接口地址**: `POST /api/article/create`

**认证要求**: ✅ 需要登录

**请求头**: 需要携带 Cookie

**请求参数**:
```json
{
  "title": "我的新文章",
  "content": "# 文章标题\n\n文章内容",
  "cover": "https://example.com/cover.jpg",
  "article_type_id": 1,
  "sort": 0,
  "is_pinned": 0,
  "is_private": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | ✅ | 文章标题 |
| content | string | ✅ | 文章内容（MD格式） |
| cover | string | ❌ | 封面图片 URL |
| article_type_id | number | ✅ | 文章类型 ID |
| sort | number | ❌ | 排序（默认 0） |
| is_pinned | number | ❌ | 是否置顶（0 否，1 是） |
| is_private | number | ❌ | 是否私密（0 否，1 是） |

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "创建成功",
  "data": {
    "id": 2,
    "title": "我的新文章"
  }
}
```

---

### 更新文章

**接口地址**: `PUT /api/article/update/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 文章 ID（数字）

**请求参数**:
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "is_pinned": 1
}
```

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "更新成功",
  "data": {
    "id": 1,
    "title": "更新后的标题"
  }
}
```

---

### 删除文章

**接口地址**: `DELETE /api/article/delete/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 文章 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "删除成功",
  "data": null
}
```

---

### 置顶/取消置顶文章

**接口地址**: `PUT /api/article/pin/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 文章 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "置顶成功",
  "data": {
    "isPinned": 1
  }
}
```

---

### 记录浏览时长

**接口地址**: `POST /api/article/:id/view`

**认证要求**: 无需认证

**路径参数**:
- `id`: 文章 ID（数字）

**请求参数**:
```json
{
  "duration": 30
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| duration | number | ✅ | 浏览时长（秒） |

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "记录成功",
  "data": null
}
```

---

### 点赞/取消点赞

**接口地址**: `POST /api/article/:id/like`

**认证要求**: 无需认证（登录用户以用户 ID 标识，未登录以 Cookie 指纹标识）

**路径参数**:
- `id`: 文章 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "liked": true,
    "likeCount": 11
  }
}
```

---

### 获取文章统计

**接口地址**: `GET /api/article/:id/stats`

**认证要求**: 无需认证

**路径参数**:
- `id`: 文章 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "viewCount": 101,
    "likeCount": 11,
    "totalViewDuration": 3630,
    "liked": true
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| viewCount | number | 浏览次数 |
| likeCount | number | 点赞数 |
| totalViewDuration | number | 总浏览时长（秒） |
| liked | boolean | 当前用户是否已点赞 |

---

## 📂 文章类型模块

### 获取文章类型列表

**接口地址**: `GET /api/article-type/list`

**认证要求**: 无需认证

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "技术博客",
      "sort": 0,
      "status": 1,
      "createTime": "2026-04-09T12:00:00.000Z",
      "updateTime": "2026-04-09T12:00:00.000Z"
    }
  ]
}
```

---

### 创建文章类型

**接口地址**: `POST /api/article-type/create`

**认证要求**: ✅ 需要登录

**请求参数**:
```json
{
  "name": "生活随笔",
  "sort": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 类型名称 |
| sort | number | ❌ | 排序（默认 0） |

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "创建成功",
  "data": {
    "id": 2,
    "name": "生活随笔"
  }
}
```

---

### 更新文章类型

**接口地址**: `PUT /api/article-type/update/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 类型 ID（数字）

**请求参数**:
```json
{
  "name": "更新后的名称",
  "sort": 2,
  "status": 1
}
```

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "更新成功",
  "data": {
    "id": 2,
    "name": "更新后的名称"
  }
}
```

---

### 删除文章类型

**接口地址**: `DELETE /api/article-type/delete/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 类型 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "删除成功",
  "data": null
}
```

---

## 📤 上传模块

### 上传图片

**接口地址**: `POST /api/upload/image`

**认证要求**: ✅ 需要登录

**请求头**: `Content-Type: multipart/form-data`

**请求参数**:
- `file`: 图片文件（支持 jpg, png, gif, webp, svg）

**限制**: 文件大小不超过 5MB

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "上传成功",
  "data": {
    "id": 1,
    "filename": "1775720848088-fl9etp.jpg",
    "path": "resource/images/1775720848088-fl9etp.jpg",
    "url": "/api/upload/images/1775720848088-fl9etp.jpg",
    "originalName": "cover.jpg",
    "size": 12345
  }
}
```

---

### 获取图片

**接口地址**: `GET /api/upload/images/:filename`

**认证要求**: 无需认证

**路径参数**:
- `filename`: 文件名

**响应**: 图片文件（Content-Type: image/jpeg 等）

---

### 删除图片

**接口地址**: `DELETE /api/upload/images/:id`

**认证要求**: ✅ 需要登录

**路径参数**:
- `id`: 图片 ID（数字）

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "删除成功",
  "data": null
}
```

---

## 📊 统计模块

### 获取报错统计

**接口地址**: `GET /api/stats/errors`

**认证要求**: ✅ 需要登录

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": {
    "totalErrors": 15,
    "errors": [
      {
        "path": "/api/article/create",
        "method": "POST",
        "errorType": "BadRequestException",
        "count": 5,
        "lastErrorTime": "2026-04-09T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 获取 Top 报错

**接口地址**: `GET /api/stats/errors/top`

**认证要求**: ✅ 需要登录

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "success",
  "data": [
    {
      "path": "/api/article/create",
      "method": "POST",
      "errorType": "BadRequestException",
      "count": 5,
      "lastErrorTime": "2026-04-09T12:00:00.000Z"
    }
  ]
}
```

---

### 清空报错统计

**接口地址**: `GET /api/stats/errors/clear`

**认证要求**: ✅ 需要登录

**响应示例**:
```json
{
  "rlt": "0",
  "msg": "统计已清空",
  "data": null
}
```

---

## 🔧 字段命名规范

### 响应字段（驼峰命名）
- `articleTypeId` - 文章类型 ID
- `articleTypeName` - 文章类型名称
- `isPinned` - 是否置顶
- `isPrivate` - 是否私密
- `viewCount` - 浏览次数
- `likeCount` - 点赞数
- `totalViewDuration` - 总浏览时长
- `createTime` - 创建时间
- `updateTime` - 更新时间

### 数据库字段（下划线命名）
- `article_type_id`
- `is_pinned`
- `is_private`
- `create_time`
- `update_time`

---

## ⚠️ 注意事项

1. **访客指纹**: 系统会自动为每个访客生成 Cookie 指纹（`visitor_fingerprint`），有效期 1 小时，用于统计和点赞去重

2. **浏览统计**: 同一访客在 1 小时内多次访问同一文章只计数一次浏览

3. **点赞去重**: 同一用户或同一访客指纹只能点赞一次，再次点击取消点赞

4. **文章详情**: 访问文章详情时自动增加浏览次数

5. **浏览时长**: 前端需要定时（建议每 30 秒）调用 `/api/article/:id/view` 接口上报浏览时长

6. **图片 URL**: 返回的 `url` 字段是相对路径，完整地址为 `http://localhost:3000{url}`
