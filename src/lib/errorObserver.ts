/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:15:47
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-05 17:48:42
 * @Description: 监控js错误以及资源加载错误
 */
import { ErrorType } from '@/types/index';
import { getStackLines } from '@/utils/index';
import { BaseError } from './baseErrorObserver';

export class ErrorObserver extends BaseError {
  constructor() {
    super();
    this.init();
  }
  private init() {
    // 监听全局未捕获的错误
    window.addEventListener(
      'error',
      (event: ErrorEvent) => {
        const target = event.target;
        // 资源加载错误
        if ((target as any)?.localName) {
          const resourceError = {
            errorType: ErrorType.ResourceError,
            tagName: (target as any).tagName, // 报错标签
            filename: (target as any).src || (target as any).href,
          };
          this.reportError(resourceError);
        } else {
          // js错误
          const resourceError = {
            errorType: ErrorType.JsError,
            message: event.message, // 报错信息
            filename: event.filename, // 报错文件
            position: `${event.lineno}:${event.colno}`, // 报错位置 行：列
            stack: getStackLines(event.error.stack),
          };
          this.reportError(resourceError);
        }
      },
      true,
    );
  }
}
