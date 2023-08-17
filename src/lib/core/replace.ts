import { EVENTTYPES, ReplaceHandler, voidFun, Callback, IAnyObject } from '@/types/index';
import { subscribeEvent, notify } from './subscribe';

function replace(type: EVENTTYPES): void {
  switch (type) {
    case EVENTTYPES.XHR:
      xhrReplace();
      break;
    // case EVENTTYPES.FETCH:
    //     fetchReplace();
    //     break;
    case EVENTTYPES.ERROR:
      listenError();
      break;
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace();
      break;
    default:
      break;
  }
}

export function addReplaceHandler(handler: ReplaceHandler): void {
  if (!subscribeEvent(handler)) return;
  replace(handler.type);
}

function listenError(): void {
  window.addEventListener(
    'error',
    function (e) {
      notify(EVENTTYPES.ERROR, e);
    },
    true,
  );
}

function getTimestamp(): number {
  return Date.now();
}

function replaceAop(source: IAnyObject, name: string, replacement: Callback, isForced = false) {
  if (source === undefined) return;
  if (name in source || isForced) {
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === 'function') {
      source[name] = wrapped;
    }
  }
}

function xhrReplace(): void {
  if (!('XMLHttpRequest' in window)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;
  replaceAop(originalXhrProto, 'open', (originalOpen: voidFun) => {
    return function (this: any, ...args: any[]): void {
      console.log('this:', this);
      this.websee_xhr = {
        method: args[0],
        url: args[1],
        sTime: getTimestamp(),
        type: 'xhr',
      };
      originalOpen.apply(this, args);
    };
  });
  replaceAop(originalXhrProto, 'send', (originalSend: voidFun) => {
    return function (this: any, ...args: any[]): void {
      // 监听loadend事件，接口成功或失败都会执行
      this.addEventListener('loadend', function (this: any) {
        const { status } = this;
        this.websee_xhr.requestData = args[0];
        const eTime = getTimestamp();
        // 设置该接口的time，用户用户行为按时间排序
        this.websee_xhr.time = this.websee_xhr.sTime;
        this.websee_xhr.Status = status;
        // 接口的执行时长
        this.websee_xhr.elapsedTime = eTime - this.websee_xhr.sTime;
        // 执行之前注册的xhr回调函数
        notify(EVENTTYPES.XHR, this.websee_xhr);
      });
      originalSend.apply(this, args);
    };
  });
}

function unhandledrejectionReplace(): void {
  window.addEventListener(EVENTTYPES.UNHANDLEDREJECTION, function (ev: PromiseRejectionEvent) {
    // 阻止默认行为后，控制台就不会再报红色错误
    ev.preventDefault();
    notify(EVENTTYPES.UNHANDLEDREJECTION, ev);
  });
}
