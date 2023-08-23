/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:22:12
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-29 16:09:21
 * @Description:
 */
// import { ErrorObserver } from '@/lib/error';
// import { UserBehaviorObserver } from '@/lib/behavior';
// import { WebVitals } from '@/lib/performance';
import { InitOptionsTyping } from '@monitor/typings';
import { setupReplace } from './core/setupReplace';

const initOptions = {
  sendPV: true,
  sendApi: true,
  sendResource: true,
  sendError: true,
  sendPerf: true,
  sendPromise: true,
  ignoreApiUrls: [] as string[],
};

export class Monitor {
  public static instance: Monitor;
  public options: Partial<InitOptionsTyping>;
  constructor(options: Partial<InitOptionsTyping> = {}) {
    this.options = Object.assign(initOptions, options);
    // this.initObserver();
    setupReplace();
  }
  /**
   * @description: 初始化Monitor实例，单例模式
   * @return {*}
   */
  static init(options: Partial<InitOptionsTyping>) {
    if (!this.instance) {
      this.instance = new Monitor(options);
    }
    return this.instance;
  }
  /**
   * @description: 初始化所有错误实例
   * @return {*}
   */
  //   initObserver() {
  //     new ErrorObserver(this.options);
  //     // new UserBehaviorObserver();
  //     // new WebVitals();
  //   }
}
