---
alwaysApply: true
---
# 后端代码规范
## 接口规范
1. 接口需要满足restful-api格式
```json
{
    "msg": "success",
    "rlt": 0,
    "data": {}
}
```
2. 提供前端接口需要有swagger注解，方便前端开发和 API 测试。