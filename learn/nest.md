# nest速查表
1. 该文件是总结官方文档说明，速查常用功能。
2. 总结部分功能和实践demo
3. 踩坑总结
## 一、概念
nest架构受angular启发，有许多相似地方`模块，依赖注入，cli指令生成代码，管道，拦截器`
1. 模块（Module）
- 和angular类似（略）
2. 控制器（Controller）
- 路由
    1. 装饰器`@Controller('/api')` 
    2. 请求方法装饰器`@Get('/hello')`
    3. 支持通配符`@Get('/hello/*')`
    4. 传参
        - 路径参数：`@Get('/hello/:id')` ... `@Param('id') id: string`
        - 查询参数：`/hello?name=nest&id=123` `@Query('name') name: string, @Query('id') id: string`
        - 请求体参数：`@Body() body: any`
            1. 需要定义好DTO类，用于接收请求体参数
            2. DTO类内部可以添加装饰器
            ```typescript
            @Get()
            findAll(@Body() petDTO: PetDTO) {
            }
            ```
        - 响应头参数：`@Header('Content-Type') contentType: string`
- 注入参数
    1. 请求方法内参数 可根据装饰器动态注入
        常用以下`@Rea\@Res\@Param\@Body\@Query...`
        具体查询文档
        ```typescript
        @Get()
        findAll(@Req() request: Request) {
            return this.appService.findAll();
        }
        ```
    2. 状态码
        1. 静态状态码：在请求方法头增加，修改http状态码`@HttpCode(200)` 默认都是200，处Post是201

3. 注入
- 作用域
    1. DEFAULT 全局单例
    2. REQUEST 每个传入的请求创建，请求处理完成后销毁。实例参与整个请求链路共享
    3. TRANSIENT 比REQUEST更频繁，每个链路都会创建新的实例
4. 中间件
- 
