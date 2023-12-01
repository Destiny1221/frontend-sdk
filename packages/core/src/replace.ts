import { options, notify, subscribeEvent } from './index';
import {
  _global,
  on,
  getTimestamp,
  replaceAop,
  getLocationHref,
  isExistProperty,
  variableTypeDetection,
  supportsHistory,
} from '@monitor/utils';
import { EVENTTYPES, HTTPTYPE } from '@monitor/common';
import { ReplaceHandler, voidFun } from '@monitor/types';

// 判断当前接口是否为需要过滤掉的接口
function isFilterHttpUrl(url: string): boolean {
  if (options.dsn === url) return true;
  return options.ignoreApis?.some((item: string) => url.includes(item)) || false;
}

const replaceMap = {
  [EVENTTYPES.ERROR]: listenError(),
  [EVENTTYPES.UNHANDLEDREJECTION]: unhandledrejectionReplace(),
  [EVENTTYPES.XHR]: xhrReplace(),
  [EVENTTYPES.FETCH]: fetchReplace(),
  [EVENTTYPES.HASHCHANGE]: listenHashchange(),
  [EVENTTYPES.HISTORY]: historyReplace(),
};
export function addReplaceHandler(handler: ReplaceHandler): void {
  if (!subscribeEvent(handler)) return;
  // @ts-ignore
  replaceMap[handler.type];
}

// 监听code error或者资源加载error 使用window.addEventListener('error,fn,true)
function listenError(): void {
  // 捕获静态资源异常，一定要设置第三个参数为true，因为资源错误只能在捕获阶段捕获。
  on(
    _global,
    'error',
    function (ev: ErrorEvent) {
      // 阻止默认行为后，控制台就不会再报红色错误
      // ev.preventDefault()
      notify(EVENTTYPES.ERROR, ev);
    },
    true,
  );
}

// 监听未捕获的promise异常使用 window.addEventListener('unhandledrejection,fn)
function unhandledrejectionReplace(): void {
  on(_global, EVENTTYPES.UNHANDLEDREJECTION, function (ev: PromiseRejectionEvent) {
    // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
    notify(EVENTTYPES.UNHANDLEDREJECTION, ev);
  });
}

// 监听fetch请求通过重写 XMLHttpRequest 原型方法open 和 send
function xhrReplace(): void {
  if (!('XMLHttpRequest' in _global)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;
  replaceAop(originalXhrProto, 'open', (originalOpen: voidFun) => {
    return function (this: any, ...args: any[]): void {
      this.mito_xhr = {
        method: variableTypeDetection.isString(args[0]) ? args[0].toUpperCase() : args[0],
        url: args[1],
        time: getTimestamp(),
        type: HTTPTYPE.XHR,
      };
      originalOpen.apply(this, args);
    };
  });
  replaceAop(originalXhrProto, 'send', (originalSend: voidFun) => {
    return function (this: any, ...args: any[]): void {
      const { url } = this.mito_xhr;
      // 监听loadend事件，接口成功或失败都会执行
      on(this, 'loadend', function (this: any) {
        if (isFilterHttpUrl(url)) return;
        const { responseType, response, status } = this;
        this.mito_xhr.requestData = args[0];
        const eTime = getTimestamp();
        this.mito_xhr.status = status;
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          this.mito_xhr.responseText = typeof response === 'object' ? JSON.stringify(response) : response;
        }
        // 接口的执行时长
        this.mito_xhr.duration = eTime - this.mito_xhr.time;
        // 执行之前注册的xhr回调函数
        notify(EVENTTYPES.XHR, this.mito_xhr);
      });
      originalSend.apply(this, args);
    };
  });
}

// 监听fetch请求通过重写window.fetch 方法
function fetchReplace(): void {
  if (!('fetch' in _global)) {
    return;
  }
  replaceAop(_global, EVENTTYPES.FETCH, (originalFetch) => {
    return function (input: any, config: RequestInit): void {
      const sTime = getTimestamp();
      const method = (config && config.method) || 'GET';
      let fetchData = {
        type: HTTPTYPE.FETCH,
        method,
        requestData: config && config.body,
        url: (input && typeof input !== 'string' ? input?.url : input) || '',
        responseText: '',
      };
      return originalFetch.apply(_global, [input, config]).then(
        (res: Response) => {
          // 克隆一份，防止被标记已消费
          const tempRes = res.clone();
          const eTime = getTimestamp();
          fetchData = Object.assign({}, fetchData, {
            duration: eTime - sTime,
            status: tempRes.status,
            time: sTime,
          });
          tempRes.text().then((data: any) => {
            // 同理，进接口进行过滤
            if (isFilterHttpUrl(fetchData.url)) return;
            fetchData.responseText = data;
            notify(EVENTTYPES.FETCH, fetchData);
          });
          return res;
        },
        // 接口报错
        (err: Error) => {
          const eTime = getTimestamp();
          if (isFilterHttpUrl(fetchData.url)) return;
          fetchData = Object.assign({}, fetchData, {
            duration: eTime - sTime,
            status: 0,
            time: sTime,
          });
          notify(EVENTTYPES.FETCH, fetchData);
          throw err;
        },
      );
    };
  });
}

// 监听hashchange事件
function listenHashchange(): void {
  // 添加对 hashchange 的监听
  // hash 变化除了触发 hashchange ,也会触发 popstate 事件,而且会先触发 popstate 事件，我们可以统一监听 popstate
  // 这里可以考虑是否需要监听 hashchange,或者只监听 hashchange
  if (isExistProperty(_global, 'onhashchange')) {
    on(_global, EVENTTYPES.HASHCHANGE, function (e: HashChangeEvent) {
      notify(EVENTTYPES.HASHCHANGE, e);
    });
  }
}

// last time route
let lastHref: string = getLocationHref();
function historyReplace(): void {
  // 是否支持history
  if (!supportsHistory()) return;
  // 添加对 popstate 的监听
  on(_global, 'popstate', function () {
    const to = getLocationHref();
    const from = lastHref;
    notify(EVENTTYPES.HISTORY, {
      from,
      to,
    });
  });

  function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
    return function (this: any, ...args: any[]): void {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        const from = lastHref;
        const to = String(url);
        lastHref = to;
        notify(EVENTTYPES.HISTORY, {
          from,
          to,
        });
      }
      return originalHistoryFn.apply(this, args);
    };
  }
  // 由于history.pushState()、history.replaceState()不会触发popstate事件，因此我们需要重写pushState、replaceState事件
  replaceAop(_global.history, 'pushState', historyReplaceFn);
  replaceAop(_global.history, 'replaceState', historyReplaceFn);
}
