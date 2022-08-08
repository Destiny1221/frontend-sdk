/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:16:31
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 17:20:44
 * @Description:
 */
import type { ResourceError, JsError, UnhandlePromiseError, XhrObserver, InitOptions } from '@/types/index';
type Message = ResourceError | JsError | UnhandlePromiseError | XhrObserver;
export class BaseError {
  public options: Partial<InitOptions>;
  constructor(options: Partial<InitOptions>) {
    this.options = options;
  }
  reportError(message: Message) {
    message.timeStamp = new Date().getTime();
    window.console.log(message);
  }
}
