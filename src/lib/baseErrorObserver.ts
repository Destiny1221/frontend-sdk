/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:16:31
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-05 18:21:02
 * @Description:
 */
import type { ResourceError, JsError } from '@/types/index';
type Message = ResourceError | JsError;
export class BaseError {
  reportError(message: Message) {
    message.timeStamp = new Date().getTime();
  }
}
