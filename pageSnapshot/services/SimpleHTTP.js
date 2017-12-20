const {promisify} = require('util');
const http = require('http');

module.exports = class SimpleHTTP {

  /**
   * @param ctx - 构造时会传递一个上下文对象，这个具体可以参考：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
   */
  constructor(ctx) {
    // 标准的日志对象
    this.logger = ctx.logger;
  }

  /**
   * abstract onRequest
   * 子类需要实现
   * HTTP 请求的处理函数
   */
  async onRequest() {
    throw new Error('PLS OVERRIDE');
  }

  /**
   * abstract onRequest
   * 子类需要实现
   * 获得要监听的 TCP Port
   */
  getPort() {
    throw new Error('PLS OVERRIDE');
  }

  /**
   * 标准的启动接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#start
   */
  async start () {

    // 创建 HTTP Server
    this.server = http.createServer((req, res) => {

      // 调用要求子类实现的 onRequest 接口
      this.onRequest.call(this, req, res).catch((err) => {
        try {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end(err && (err instanceof Error ? err.toString() : JSON.stringify(err)));
        } catch(err) {
          this.logger.error(err);
          res.end();
        }
      });

    });

    // 异步等待 Server 监听成功才算启动完成
    await promisify(this.server.listen).call(this.server, this.getPort());

    // 启动完成
    this.logger.info(`Service ${this.constructor.name} Listens On http://127.0.0.1:${this.getPort()}`);

  }

  /**
   * 标准的停止接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#stop
   */
  async stop() {

    // 异步等待取消监听成功才算停止完成
    await promisify(this.server.close).call(this.server);

    // 停止完成
    this.logger.info(`Service ${this.constructor.name} Stopped`);

  }

};
