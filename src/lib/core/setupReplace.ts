import { addReplaceHandler } from './replace';
import { EVENTTYPES } from '@/types/index';
export function setupReplace(): void {
  // 重写XMLHttpRequest
  addReplaceHandler({
    callback: (data: any) => {
      console.log(EVENTTYPES.XHR, data);
    },
    type: EVENTTYPES.XHR,
  });
  // 重写fetch
  addReplaceHandler({
    callback: (data: any) => {
      console.log(EVENTTYPES.FETCH, data);
    },
    type: EVENTTYPES.FETCH,
  });
  // 捕获错误
  addReplaceHandler({
    callback: (error: any) => {
      console.log(EVENTTYPES.ERROR, error);
    },
    type: EVENTTYPES.ERROR,
  });
  // 添加handleUnhandleRejection事件
  addReplaceHandler({
    callback: (data: any) => {
      console.log(EVENTTYPES.UNHANDLEDREJECTION, data);
    },
    type: EVENTTYPES.UNHANDLEDREJECTION,
  });
}
