/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:16:31
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-07 18:25:33
 * @Description:
 */
import type { ResourceError, JsError, UnhandlePromiseError } from '@/types/index';
type Message = ResourceError | JsError | UnhandlePromiseError;
export class BaseError {
  reportError(message: Message) {
    message.timeStamp = new Date().getTime();
    window.console.log(message);
  }
}
