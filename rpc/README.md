
### 安装依赖

```bash
$ npm install
```


### 启动本地 etcd

请确保已经安装，如何安装自行 Google

```bash
$ etcd # 启动 etcd
```

### 本地前台启动

```bash
$ pandora dev # 本地前台启动项目
```

查看 etcd 中是否上线

```bash
$ curl http://127.0.0.1:2379/v2/keys/JSONRPC
{"action":"get","node":{"key":"/JSONRPC","dir":true,"nodes":[{"key":"/JSONRPC/5a32f5ab-f423-4b3c-b661-4a12e8ece5b2","value":"{\"uuid\":\"5a32f5ab-f423-4b3c-b661-4a12e8ece5b2\",\"hostname\":\"127.0.0.1\",\"port\":5222}","expiration":"2017-12-19T06:29:46.648936363Z","ttl":59,"modifiedIndex":11,"createdIndex":11}],"modifiedIndex":4,"createdIndex":4}}
```

`Ctrl + c` 关闭查看 etcd 中是否已经下线：

```bash
$ curl http://127.0.0.1:2379/v2/keys/JSONRPC
{"action":"get","node":{"key":"/JSONRPC","dir":true,"modifiedIndex":4,"createdIndex":4}}
```

### 访问 HTTP 接口测试

例子里面有一个 HTTP Server 监听在 5555 端口，会作为一个 RPC 的消费端，通过 etcd 发现 RPC 服务并进行调用。

访问地址 `http://127.0.0.1:5555/?method=add&params=[1,5]`

> {"jsonrpc":"2.0","id":"30a7767a-1173-41f3-be22-94376d9409f1","result":6}