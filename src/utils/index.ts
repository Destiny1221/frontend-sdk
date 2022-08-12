/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:28:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-11 18:29:16
 * @Description:
 */
import { MechanismType } from '@/lib/error';

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
  if (!isJsError) return MechanismType.RS;
  return event.message === 'Script error.' ? MechanismType.CS : MechanismType.JS;
};

// 对每一个错误详情，生成一串编码
export const getErrorUid = (input: string) => {
  return window.btoa(unescape(encodeURIComponent(input)));
};
