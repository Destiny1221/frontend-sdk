/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:16:31
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-12 14:52:56
 * @Description:
 */
import type { ResourceError, JsError, UnhandlePromiseError, XhrObserver, InitOptionsTyping } from '@/types/index';
type Message = ResourceError | JsError | UnhandlePromiseError | XhrObserver;
export class BaseObserver {
  public options: Partial<InitOptionsTyping>;
  constructor(options: Partial<InitOptionsTyping>) {
    this.options = options;
  }
  reportError(message: Message) {
    message.timeStamp = new Date().getTime();
    window.console.log(message);
  }
}
