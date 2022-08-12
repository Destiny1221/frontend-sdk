/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:22:12
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-12 16:48:06
 * @Description:
 */
import './example.js';
import { ErrorObserver } from '@/lib/error';
import { InitOptionsTyping } from '@/types/index';
import { initOptions } from './options';
export class Monitor {
  public static instance: Monitor;
  public options: Partial<InitOptionsTyping>;
  constructor(options: Partial<InitOptionsTyping> = {}) {
    this.options = Object.assign(initOptions, options);
    this.initObserver();
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
  initObserver() {
    new ErrorObserver(this.options);
  }
}

new Monitor();
