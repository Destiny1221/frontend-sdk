/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:28:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-30 14:51:33
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

export interface MPerformanceNavigationTiming {
  FP?: number;
  TTI?: number;
  DomReady?: number;
  Load?: number;
  FirstByte?: number;
  DNS?: number;
  TCP?: number;
  SSL?: number;
  TTFB?: number;
  Trans?: number;
  DomParse?: number;
  Res?: number;
}

export interface PerformanceEntryHandler {
  (entry: any): void;
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

// 页面渲染之后的回调，用于性能监控
export const afterLoad = (callback: any) => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback, { once: true, capture: true });
  }
};

/**
 *
 * @param type
 * @param callback
 * @returns
 * 性能监控，使用new PerformanceObserver().observe API实现对特定性能指标的监控
 * type：监控某项想能指标
 * entryTypes:Array 监控传入需要监控的性能指标
 */
export const observe = (type: string, callback: PerformanceEntryHandler): void => {
  // 类型合规，就返回 observe
  if (PerformanceObserver.supportedEntryTypes?.includes(type)) {
    new PerformanceObserver((entryList, observer) => {
      entryList.getEntries().map(callback);
      observer.disconnect(); // 不需要再观察了
    }).observe({ type, buffered: true });
  }
};

/**
 * FP:页面视觉首次发生变化的时间点,FP不包含默认背景绘制
 * @param cb
 */
export const getFP = (cb: PerformanceEntryHandler): void => {
  // 方法一
  observe('paint', (entry: PerformanceEntry) => {
    if (entry.name === 'first-paint') {
      typeof cb === 'function' &&
        cb({
          type: 'FP',
          entry,
        });
    }
  });
  // 方法二
  // const [entry] = performance.getEntriesByName('first-paint')
};

/**
 * FCP:首次绘制任何文本、图像、非空白canvas或者SVG的时间点
 * 与FP的区别：
 *    1、FCP是首次绘制来自DOM的有效内容的时间点，所以FP可能等于FCP，也可能先于FCP。
 * 比如当我们给body增加背景色时，FP就是记录开始绘制背景色的时间点，FCP则是在body生成之后，首次绘制DOM的有效内容的时间点
 * @param cb
 */
export const getFCP = (cb: PerformanceEntryHandler): void => {
  // 方法一
  observe('paint', (entry: PerformanceEntry) => {
    if (entry.name === 'first-contentful-paint') {
      typeof cb === 'function' &&
        cb({
          type: 'FCP',
          entry,
        });
    }
  });
  // 方法二
  // const [entry] = performance.getEntriesByName('first-contentful-paint')
};

/**
 * FMP(首次有效绘制):首屏时间，通过FCP的介绍我们可能认为FMP就是首屏时间，其实不是，FMP是首次绘制任何文本，按照这种逻辑客户端
 * 渲染了一个字的时间点就是首屏时间了。FMP可以定义为页面渲染过程中元素增量最大的点的时间段，一般就是首屏时间所在的
 * 时间点。W3C已经将首屏统计进入了提议阶段。
 *
 * TODO:本方法经测试失效，还需要重新寻找新方法。
 * @param cb
 */
export const getFMP = (cb: PerformanceEntryHandler): void => {
  observe('element', (entry: PerformanceEntry) => {
    cb(entry);
  });
};

/**
 * 页面首次开始加载的时间点，到可视区域最大的图像或文本块完成渲染的相对事件，可以测试用户主管感知到的页面的加载速度，因为
 * 最大内容绘制完成时，往往认为页面将要加载完成。
 * @param cb
 */
export const getLCP = (cb: PerformanceEntryHandler): void => {
  observe('largest-contentful-paint', (entry: PerformanceEntry) => {
    cb(entry);
  });
};

/**
 * FID:用户第一次与页面交互(点击链接、或者按钮时)直到浏览器对交互做出相应
 * @param cb
 */
export const getFID = (cb: PerformanceEntryHandler): void => {
  observe('first-input', (entry: PerformanceEntry) => {
    cb(entry);
  });
};

/**
 * CLS:测量整个页面声明周期内发生的所有意外布局偏移中最大的布局偏移分数，每当一个已渲染的元素的可见位置变更
 * 到下一个可见位置时，就发生布局偏移
 * @param cb
 */
export const getCLS = (cb: PerformanceEntryHandler): void => {
  observe('layout-shift', (entry: PerformanceEntry) => {
    cb(entry);
  });
};

// 获取一个页面的关键时间点以及时间段的数据
export const getNavigationTiming = (): MPerformanceNavigationTiming | undefined => {
  const resolveNavigationTiming = (entry: PerformanceNavigationTiming): MPerformanceNavigationTiming => {
    const {
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventEnd,
      loadEventStart,
      fetchStart,
    } = entry;

    return {
      // 关键时间点
      FP: responseEnd - fetchStart, //白屏时间：从请求开始到浏览器开始解析第一批HTML文档字节的时间
      TTI: domInteractive - fetchStart, //首次可交互时间：浏览器完成所有HTML解析并且完成DOM构建，此时浏览器开始加载资源。
      DomReady: domContentLoadedEventEnd - fetchStart, //HTML加载完成时间：单页面客户端渲染下，为生成模板dom树所花费时间；非单页面或单页面服务端渲染下，为生成实际dom树所花费时间
      Load: loadEventStart - fetchStart, //页面完全加载时间：Load=首次渲染时间+DOM解析耗时+同步JS执行+资源加载耗时
      FirstByte: responseStart - domainLookupStart, //首包时间：从DNS解析到响应返回给浏览器第一个字节的时间
      // 关键时间段
      DNS: domainLookupEnd - domainLookupStart, //DNS查询耗时
      TCP: connectEnd - connectStart, //TCP连接耗时
      SSL: secureConnectionStart ? connectEnd - secureConnectionStart : 0, //SSL安全连接耗时
      TTFB: responseStart - requestStart, //请求响应耗时
      Trans: responseEnd - responseStart, //内容传输耗时
      DomParse: domInteractive - responseEnd, //DOM解析耗时
      Res: loadEventStart - domContentLoadedEventEnd, //资源加载耗时（页面同步加载的资源）
    };
  };

  const navigation =
    // W3C Level2  PerformanceNavigationTiming
    // 使用了High-Resolution Time，时间精度可以达毫秒的小数点好几位。
    performance.getEntriesByType('navigation').length > 0
      ? performance.getEntriesByType('navigation')[0]
      : performance.timing; // W3C Level1  (目前兼容性高，仍然可使用，未来可能被废弃)。
  return resolveNavigationTiming(navigation as PerformanceNavigationTiming);
};

/**
 * 监听页面卡顿，通过entry.duration > 100 判断大于100ms，即可认定为长任务
 * 使用requestIdleCallback上报数据
 */
export function longTask() {
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        requestIdleCallback(() => {
          window.console.log(entry);
        });
      }
    });
  }).observe({ entryTypes: ['longtask'] });
}
