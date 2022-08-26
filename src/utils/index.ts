/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:28:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-26 11:00:53
 * @Description:
 */
import { MonitorErrorType } from '@/lib/error';

type HistoryFunHandler = (event: Event) => unknown;

export interface httpMetrics {
  method: string;
  url: string | URL;
  body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;
  requestTime: number;
  responseTime: number;
  status: number;
  statusText: string;
  response?: any;
}
export interface OriginInformation {
  referrer: string;
  type: number | string;
}

export const getStackLines = (stack: string) => {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
};

export const serilizeUrl = (url: string) => {
  const result: Record<string, string> = {};
  if (url.split('?').length > 1) {
    url = url.split('?')[1];
    const params = url.split('&');
    params.forEach((item) => {
      result[item.split('=')[0]] = item.split('=')[1];
    });
  }
  return result;
};

// 判断是 JS异常、静态资源异常、还是跨域异常
export const getErrorKey = (event: ErrorEvent | Event) => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return MonitorErrorType.RS;
  return event.message === 'Script error.' ? MonitorErrorType.CS : MonitorErrorType.JS;
};

// 对每一个错误详情，生成一串编码
export const getErrorUid = (input: string) => {
  return window.btoa(unescape(encodeURIComponent(input)));
};

/**
 * 派发新的event
 * 由于history.pushState()、history.replaceState()不会触发popstate事件，因此我们需要创建新的全局Event事件，然后在
 * window.addEventListenner监听我们加的Event即可。
 * @param type
 * @returns
 */
const wr = (type: keyof History) => {
  const orig = history[type];
  return function (this: unknown) {
    // 执行原始的history相关方法
    const rv = orig.apply(this, arguments);
    // 派发新的event
    const e = new Event(type);
    window.dispatchEvent(e);
    return rv;
  };
};

// 添加 pushState replaceState 事件
export const wrHistory = (): void => {
  history.pushState = wr('pushState');
  history.replaceState = wr('replaceState');
};

// 为 pushState 以及 replaceState 方法添加 Event 事件
export const proxyHistory = (handler: HistoryFunHandler): void => {
  // 添加对 replaceState 的监听
  window.addEventListener('replaceState', (e) => handler(e), true);
  // 添加对 pushState 的监听
  window.addEventListener('pushState', (e) => handler(e), true);
};

export const proxyHash = (handler: HistoryFunHandler): void => {
  // 添加对 hashchange 的监听
  // hash 变化除了触发 hashchange ,也会触发 popstate 事件,而且会先触发 popstate 事件，我们可以统一监听 popstate
  // 这里可以考虑是否需要监听 hashchange,或者只监听 hashchange
  window.addEventListener('hashchange', (e) => handler(e), true);
  // 添加对 popstate 的监听
  // 浏览器回退、前进行为触发的 可以自己判断是否要添加监听
  window.addEventListener('popstate', (e) => handler(e), true);
};

/**
 * referrer:来路地址，获取我们我们网页上的前一个网页地址，但是有几种场景获取到的值是空
 *  1.直接在地址栏输入地址跳转
 *  2.直接从浏览器收藏夹打开
 *  3.从https协议的网站直接进入一个http协议的网站
 *
 * window.performance?.navigation.type判断用户在我们网页上的来路方式，该属性返回一个整数值
 * 0: 点击链接、地址栏输入、表单提交、脚本操作等。
 * 1: 点击重新加载按钮、location.reload。
 * 2: 点击前进或后退按钮。
 * 255: 任何其他来源。即非刷新/非前进后退、非点击链接/地址栏输入/表单提交/脚本操作等。
 * @returns
 */
export const getOriginInfo = (): OriginInformation => {
  return {
    referrer: document.referrer,
    type: window.performance?.navigation.type || '',
  };
};

// 调用 proxyXmlHttp 即可完成全局监听 XMLHttpRequest
export const proxyXmlHttp = (sendHandler: typeof Function | null | undefined, loadHandler: typeof Function) => {
  if ('XMLHttpRequest' in window && typeof window.XMLHttpRequest === 'function') {
    const oXMLHttpRequest = window.XMLHttpRequest;
    if (!(window as any).oXMLHttpRequest) {
      // oXMLHttpRequest 为原生的 XMLHttpRequest，可以用以 SDK 进行数据上报，区分业务
      (window as any).oXMLHttpRequest = oXMLHttpRequest;
    }
    (window as any).XMLHttpRequest = function () {
      // 覆写 window.XMLHttpRequest
      const xhr = new oXMLHttpRequest();
      const { open, send } = xhr;
      let metrics = {} as httpMetrics;
      xhr.open = (method, url) => {
        metrics.method = method;
        metrics.url = url;
        open.call(xhr, method, url, true);
      };
      xhr.send = (body) => {
        metrics.body = body || '';
        metrics.requestTime = new Date().getTime();
        // sendHandler 可以在发送 Ajax 请求之前，挂载一些信息，比如 header 请求头
        // setRequestHeader 设置请求header，用来传输关键参数等
        // xhr.setRequestHeader('xxx-id', 'VQVE-QEBQ');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof sendHandler === 'function') sendHandler(xhr);
        send.call(xhr, body);
      };
      xhr.addEventListener('loadend', () => {
        const { status, statusText, response } = xhr;
        metrics = {
          ...metrics,
          status,
          statusText,
          response,
          responseTime: new Date().getTime(),
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof loadHandler === 'function') loadHandler(metrics);
        // xhr.status 状态码
      });
      return xhr;
    };
  }
};

// 调用 proxyFetch 即可完成全局监听 fetch
export const proxyFetch = (sendHandler: typeof Function | null | undefined, loadHandler: typeof Function) => {
  if ('fetch' in window && typeof window.fetch === 'function') {
    const oFetch = window.fetch;
    if (!(window as any).oFetch) {
      (window as any).oFetch = oFetch;
    }
    (window as any).fetch = async (input: any, init: RequestInit) => {
      // init 是用户手动传入的 fetch 请求互数据，包括了 method、body、headers，要做统一拦截数据修改，直接改init即可
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (typeof sendHandler === 'function') sendHandler(init);
      let metrics = {} as httpMetrics;

      metrics.method = init?.method || '';
      metrics.url = (input && typeof input !== 'string' ? input?.url : input) || ''; // 请求的url
      metrics.body = init?.body || '';
      metrics.requestTime = new Date().getTime();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return oFetch.call(window, input, init).then(async (response) => {
        // clone 出一个新的 response,再用其做.text(),避免 body stream already read 问题
        const res = response.clone();
        metrics = {
          ...metrics,
          status: res.status,
          statusText: res.statusText,
          response: await res.text(),
          responseTime: new Date().getTime(),
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof loadHandler === 'function') loadHandler(metrics);
        return response;
      });
    };
  }
};
