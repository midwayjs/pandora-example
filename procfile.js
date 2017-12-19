module.exports = function(pandora) {

  /**
   * Part 1 : 基础 Service
   * Etcd 是所有进程都要有的基础 Service
   * 使用 weak-all 分配到全部启动了的进程
   */
  pandora

    // 定义 Service 的名字叫 etcd
    .service('etcd', './services/Etcd')

    // weak-all 表示这个 service 不激活任何进程
    // 但是会分配到激活了的进程中去
    .process('weak-all')

    // 配置 ETCD 的地址
    .config({
      host: 'http://localhost:2379'
    });

  /**
   * Part 2 : RPC 进程
   */
  pandora

  // 定义一个进程专门发布 RPC
    .process('rpc')
    .scale(1);

  // 向 rpc 进程注入一个 叫 tryRpc 的 RPC 实现 Service
  pandora
    .service('tryRpc', './services/TryRpc')
    .process('rpc')
    .config({
      port: 5222
    });

  /**
   * Part 3 : 测试用的 Web 进程
   * 一个测试进程，本不应该存在的，为了方便例子演示
   */
  // 定义一个进程专门发布 Web 服务
  pandora
    .process('web')
    .scale(1);

  // 向 rpc 进程注入一个 叫 tryWeb 的 Web 实现 Service
  pandora
    .service('tryWeb', './services/TryWeb')
    .process('web')
    .config({
      port: 5555
    });

};
