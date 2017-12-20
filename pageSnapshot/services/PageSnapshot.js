const puppeteer = require('puppeteer');

module.exports = class PageSnapshot {

  /**
   * @param ctx - 构造时会传递一个上下文对象，这个具体可以参考：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
   */
  constructor(ctx) {

    // 标准的日志对象
    this.logger = ctx.logger;

  }

  /**
   * 标准的启动接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#start
   */
  async start() {

    // 启动一个 Headless Chrome
    this.browser = await puppeteer.launch();

    // 启动完毕
    this.logger.info('Service PageSnapshot Started');

  }

  /**
   * 标准的停止接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#stop
   */
  async stop() {

    // 关闭 Headless Chrome
    await this.browser.close();

    // 启动完毕
    this.logger.info('Service PageSnapshot Stopped');

  }

  async take(url) {

    // 新建一个页面
    const page = await this.browser.newPage();

    // 跳转到目标地址
    await page.goto(url);

    // 截图
    const buf = await page.screenshot({type: 'jpeg', quality: 60});

    // 关闭页面
    await page.close();

    // 返回
    return {
      // 现在 IPC Hub 不能直接传递 Buffer，需要 base64。
      base64: buf.toString('base64')
    }

  }

};