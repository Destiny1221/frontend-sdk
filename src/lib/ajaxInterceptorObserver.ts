/*
 * @Author: yuzy
 * @Date: 2022-08-08 10:58:16
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 17:42:01
 * @Description:
 */
import { ErrorType, HandlerParams, InitOptions } from '@/types/index';
import { serilizeUrl } from '@/utils/index';
import { BaseError } from './baseErrorObserver';

export class AjaxInterceptorObserver extends BaseError {
  constructor(options: Partial<InitOptions>) {
    super(options);
    this.init();
  }
  private init() {
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
  }
}
