import { EVENTTYPES } from '@monitor/common';
import { HandleEvents } from './handleEvents';
import { addReplaceHandler } from './replace';

export function setupReplace(): void {
  // 捕获错误（代码错误和资源错误）
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error);
    },
    type: EVENTTYPES.ERROR,
  });
  // 捕获未处理的promise异常
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleUnhandleRejection(data);
    },
    type: EVENTTYPES.UNHANDLEDREJECTION,
  });
  // 捕获xhr请求
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.XHR);
    },
    type: EVENTTYPES.XHR,
  });
  // 捕获fetch请求
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, EVENTTYPES.FETCH);
    },
    type: EVENTTYPES.FETCH,
  });
  // 捕获hashchange
  addReplaceHandler({
    callback: (e: HashChangeEvent) => {
      HandleEvents.handleHashchange(e);
    },
    type: EVENTTYPES.HASHCHANGE,
  });
  // 捕获history模式路由的变化
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data);
    },
    type: EVENTTYPES.HISTORY,
  });
}
