
### 安装依赖

```bash
$ npm install
```

### 本地前台启动

```bash
$ pandora dev # 本地前台启动项目
2017-12-20 21:49:51,318 INFO 94498 [serviceName: web, processName: worker] Service Web Listens On http://127.0.0.1:5511
2017-12-20 21:49:51,320 INFO 94496 Process [name = worker, pid = 94498] Started successfully!
2017-12-20 21:49:51,877 INFO 94499 [serviceName: pageSnapshot, processName: background] Service PageSnapshot Started
2017-12-20 21:49:51,879 INFO 94496 Process [name = background, pid = 94499] Started successfully!
** Application start successful. **
```

### 浏览器访问查看效果

浏览器访问 `http://127.0.0.1:5511/?url=https://example.com/`

