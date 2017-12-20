module.exports = function(pandora) {

  /** 
    重要前提:
    Pandora.js 中已经默认包含 worker 和 background 的进程定义
    ，只要往里面注册 Service 就能激活。
      pandora.process('worker').scale(pandora.dev ? 1: 'auto');
      pandora.process('background').scale(1);
  */

  // 调整后台任务进程（background）的内存限制
  pandora
    .process('background')
    .argv(['--max-old-space-size=512']);

  // 将截图服务放到 background 进程
  pandora
    .service('pageSnapshot', './services/PageSnapshot')
    .process('background')

    // *** 重要：表示发布到 IPC-Hub 中
    .publish();

  // 将 Web 服务放到 worker 进程
  pandora
    .service('web', './services/Web')
    .process('worker')
    .config({
      // 配置监听端口号
      port: 5511
    });

};
