/*
 * @Author: yuzy
 * @Date: 2022-08-05 17:48:25
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-07 18:43:25
 * @Description: promise异常
 */
import { ErrorType } from '@/types/index';
import { getStackLines } from '@/utils/index';
import { BaseError } from './baseErrorObserver';

export class PromiseErrorObserver extends BaseError {
  constructor() {
    super();
    this.init();
  }
  private init() {
    // promise异常未处理的可以监听该事件
    window.addEventListener(
      'unhandledrejection',
      (event) => {
        let message = '';
        let filename = '';
        let line = 0;
        let column = 0;
        let stack = '';
        const reason = event.reason;
        if (typeof reason === 'string') {
          message = reason;
        } else if (typeof reason === 'object') {
          message = reason.message;
          if (reason.stack) {
            const matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
            filename = matchResult[1];
            line = matchResult[2];
            column = matchResult[3];
            stack = getStackLines(reason.stack);
          }
        }
        const promiseError = {
          errorType: ErrorType.UnHandleRejectionError,
          message, // 报错信息
          filename, // 哪个文件报错了
          position: `${line}:${column}`, // 报错的行列位置
          stack,
        };
        this.reportError(promiseError);
      },
      true,
    );
  }
}
