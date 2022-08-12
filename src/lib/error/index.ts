/*
 * @Author: yuzy
 * @Date: 2022-08-11 17:39:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-12 17:15:25
 * @Description: 错误异常监控
 */
import { ErrorType, HandlerParams, InitOptionsTyping } from '@/types/index';
import { serilizeUrl } from '@/utils/index';
import { getStackLines, getErrorKey, getErrorUid } from '@/utils/index';
import { BaseObserver } from '@/lib/core/baseObserver';

// 错误类型
export enum MonitorErrorType {
  JS = 'js',
  RS = 'resource',
  UJ = 'unhandledrejection',
  HP = 'http',
  CS = 'cors',
  VUE = 'vue',
}

interface ResourceErrorTarget {
  src?: string;
  tagName?: string;
  href?: string;
}

export class ErrorObserver extends BaseObserver {
  constructor(options: Partial<InitOptionsTyping>) {
    super(options);
    // 初始化 js错误
    this.initJsError();
    // 初始化 静态资源加载错误
    this.initResourceError();
    // 初始化 Promise异常
    this.initPromiseError();
    // 初始化 HTTP请求异常
    this.initHttpObserver();
    // 初始化 跨域脚本异常
    this.initCorsError();
    // 初始化 Vue异常
    // this.initVueError(Vue);
  }
  // 初始化 JS异常 的数据获取和上报
  initJsError = (): void => {
    const handler = (event: ErrorEvent) => {
      // 阻止向上抛出控制台报错
      event.preventDefault();
      // 如果不是JS异常 就结束
      if (getErrorKey(event) !== MonitorErrorType.JS) return;
      const resourceError = {
        errorType: ErrorType.JsError,
        type: event.error.name || 'Unknown',
        errorUid: getErrorUid(`${MonitorErrorType.JS}-${event.message}-${event.filename}`),
        message: event.message, // 报错信息
        filename: event.filename, // 报错文件
        position: `${event.lineno}:${event.colno}`, // 报错位置 行：列
        stack: getStackLines(event.error.stack),
      };
      window.console.log(resourceError);
    };
    window.addEventListener('error', (event) => handler(event), true);
  };
  // 初始化 静态资源异常
  initResourceError = (): void => {
    const handler = (event: Event) => {
      // 阻止向上抛出控制台报错
      event.preventDefault();
      // 如果不是静态异常就结束
      if (getErrorKey(event) !== MonitorErrorType.RS) return;
      const target = event.target as ResourceErrorTarget;
      const resourceError = {
        errorType: ErrorType.ResourceError,
        url: target.src || target.href, //报错文件
        type: target.tagName, //报错标签
        errorUid: getErrorUid(`${MonitorErrorType.RS}-${target.src || target.href}-${target.tagName}`),
      };
      window.console.log(resourceError);
    };
    // 捕获静态资源异常，一定要设置第三个参数为true，因为资源错误只能在捕获阶段捕获。
    window.addEventListener('error', (event) => handler(event), true);
  };
  // 初始化promise未捕获异常
  initPromiseError = (): void => {
    // promise异常未处理的可以监听该事件
    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {
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
            if (matchResult) {
              filename = matchResult[1];
              line = matchResult[2];
              column = matchResult[3];
            }
            stack = getStackLines(reason.stack);
          }
        }
        window.console.log(event.reason.name || 'UnKnowun');
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
  };
  /**
   * 初始化跨域脚本异常
   * 这种错误我们平时很少能够遇到，比如说当我们在index.html中引用的不是同一域下的错误脚本
   * <script async src="http://127.0.0.1:3000/error.js"> </script>
   * 我们在控制台能够发现有具体的报错信息，但是event.message值却是"Script error.",并且无法获取错误行数、列数、文件名等信息。
   *
   * 这是浏览器的安全机制造成的：当跨域加载的脚本中发生语法错误时，浏览器出于安全考虑，不会报告错误的细节，而只报告简单的
   * Script error。浏览器只允许同域下的脚本捕获具体错误信息，而其他脚本只知道发生了一个错误，但无法获知错误的具体内容
   * （控制台仍然可以看到，但是JS脚本无法捕获）
   *
   * 处理：对于第三方脚本错误，我们捕获或者不捕获都是可以的，如果捕获的话，只需要上报类型即可。
   * 补充：我们如何捕获跨域脚本错误详情呢，只需要开启跨域资源共享CORS。
   *  1. 添加crossorigin="anonymous"属性
   *     <script async src="http://localhost:3000/error.js" crossorigin="anonymous"></script>
   *  2. 添加跨域HTTP响应头
   *     Access-Control-Allow-Origin: *
   *  通过上面两个步骤，我们就能正常捕获JS异常了。
   */
  initCorsError = (): void => {
    const handler = (event: ErrorEvent) => {
      // 阻止向上抛出控制台报错
      event.preventDefault();
      // 如果不是跨域脚本异常,就结束
      if (getErrorKey(event) !== MonitorErrorType.CS) return;
      const exception = {
        // 上报错误归类
        type: MonitorErrorType.CS,
        // 错误信息
        value: event.message,
        // 错误的标识码
        errorUid: getErrorUid(`${MonitorErrorType.CS}-${event.message}`),
      };
      // 自行上报异常，也可以跨域脚本的异常都不上报;
      window.console.log(exception);
    };
    window.addEventListener('error', (event) => handler(event), true);
  };
  // 初始化http监控
  initHttpObserver = (): void => {
    const _this = this;
    const XMLHttpRequest = window.XMLHttpRequest;
    const { open } = XMLHttpRequest.prototype;
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
      const originUrl: string = typeof url === 'string' ? url : url.href;
      // 上报的接口以及用户自动以接口不用处理上报
      const flag = _this.options.ignoreApiUrls.some((item) => originUrl.includes(item));
      if (!flag) {
        this.logData = {
          method,
          url: originUrl,
        };
      }
      return open.apply(this, arguments);
    };
    const { send } = XMLHttpRequest.prototype;
    XMLHttpRequest.prototype.send = function (body) {
      if (this.logData) {
        const start = Date.now();
        const handler = (type: HandlerParams) => () => {
          const duration = Date.now() - start;
          const status = this.status;
          const statusText = this.statusText;
          const obj = {
            errorType: ErrorType.AjaxRequestError, //xhr
            xhrType: type, //load error abort
            pathname: this.logData.url, //接口的url地址
            status: status + '-' + statusText,
            duration: duration, //接口耗时
            response: this.response || '',
            queryParams: JSON.stringify(serilizeUrl(this.logData.url)),
            bodyParams: body || '',
          };
          _this.reportError(obj);
        };
        this.addEventListener('load', handler('load'), false);
        this.addEventListener('error', handler('error'), false);
        this.addEventListener('abort', handler('abort'), false);
      }
      send.apply(this, arguments);
    };
  };
}
