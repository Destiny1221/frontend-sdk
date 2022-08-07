/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:22:12
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-07 18:11:12
 * @Description:
 */
import { ErrorObserver } from '@/lib/errorObserver';
import { PromiseErrorObserver } from '@/lib/promiseErrorOberver';
export class Monitor {
  public static instance: Monitor;
  constructor() {
    this.initObserver();
  }
  /**
   * @description: 初始化Monitor实例，单例模式
   * @return {*}
   */
  static init() {
    if (!this.instance) {
      this.instance = new Monitor();
    }
    return this.instance;
  }
  /**
   * @description: 初始化所有错误实例
   * @return {*}
   */
  initObserver() {
    new ErrorObserver();
    new PromiseErrorObserver();
  }
}
