/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:16:31
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-07 18:11:01
 * @Description:
 */
import type { ResourceError, JsError } from '@/types/index';
type Message = ResourceError | JsError;
export class BaseError {
  reportError(message: Message) {
    message.timeStamp = new Date().getTime();
    window.console.log(message);
  }
}
