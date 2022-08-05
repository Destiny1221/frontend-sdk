/*
 * @Author: yuzy
 * @Date: 2022-08-05 17:48:25
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-05 18:22:33
 * @Description: promise异常
 */
// import { ErrorType } from '@/types/index'
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
      function (event) {
        let message;
        let filename;
        let lineno = 0;
        let colno = 0;
        let stack = '';
        // console.log(event)
        const reason = event.reason;
        if (typeof reason === 'string') {
          message = reason;
        } else if (typeof reason === 'object') {
          message = reason.message;
          if (reason.stack) {
            const matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
            filename = matchResult[1];
            lineno = matchResult[2];
            colno = matchResult[3];
            stack = getStackLines(reason.stack);
          }
        }
        const obj: Record<string, string> = {
          kind: 'stability', // 稳定性(大类)
          type: 'error', // 小类（js error）
          errorType: 'promiseError', // JS执行错误
          message, // 报错信息
          filename, // 报错文件
          position: `${lineno}:${colno}`, // 报错位置 行：列
          stack,
        };
        obj.name = 'jack';
      },
      true,
    );
  }
}
