/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:22:12
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 17:34:23
 * @Description:
 */
import { ErrorObserver } from '@/lib/errorObserver';
import { PromiseErrorObserver } from '@/lib/promiseErrorOberver';
import { AjaxInterceptorObserver } from '@/lib/ajaxInterceptorObserver';
import { InitOptions } from '@/types/index';
import { initOptions } from './options';
export class Monitor {
  public static instance: Monitor;
  public options: Partial<InitOptions>;
  constructor(options: Partial<InitOptions> = {}) {
    this.options = Object.assign(initOptions, options);
    this.initObserver();
  }
  /**
   * @description: 初始化Monitor实例，单例模式
   * @return {*}
   */
  static init(options: Partial<InitOptions>) {
    if (!this.instance) {
      this.instance = new Monitor(options);
    }
    return this.instance;
  }
  /**
   * @description: 初始化所有错误实例
   * @return {*}
   */
  initObserver() {
    if (this.options.sendError || this.options.sendResource) {
      new ErrorObserver(this.options);
    }
    if (this.options.sendPromise) {
      new PromiseErrorObserver(this.options);
    }
    if (this.options.sendApi) {
      new AjaxInterceptorObserver(this.options);
    }
  }
}
