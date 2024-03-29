import { getFlag, nativeTryCatch, setFlag, logger } from '@monitor/utils';
import { ReplaceHandler, ReplaceCallback } from '@monitor/types';
import { EVENTTYPES } from '@monitor/common';

const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {};

// subscribeEvent 设置标识，并将处理的方法放置到handlers中，{ xhr: [ funtion ] }
export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || getFlag(handler.type)) return false;
  setFlag(handler.type, true);
  handlers[handler.type] = handlers[handler.type] || [];
  handlers[handler.type]?.push(handler.callback);
  return true;
}
export function notify(type: EVENTTYPES, data?: any): void {
  if (!type || !handlers[type]) return;
  // 获取对应事件的回调函数并执行，回调函数为addReplaceHandler事件中定义的事件
  handlers[type]?.forEach((callback) => {
    nativeTryCatch(
      () => {
        callback(data);
      },
      (e: Error) => {
        logger.error(`重写事件notify的回调函数发生错误:${e}`);
      },
    );
  });
}
