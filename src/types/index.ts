/*
 * @Author: yuzy
 * @Date: 2022-08-05 16:49:19
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-12 14:52:33
 * @Description:
 */
export enum ErrorType {
  JsError = 'jsError',
  UnHandleRejectionError = 'unHandleRejectionError',
  ResourceError = 'resourceError',
  AjaxRequestError = 'xhr',
}
export interface InitOptionsTyping {
  // 是否上报js错误
  sendError: boolean;
  sendPV: boolean; // 是否上报页面 PV
  sendApi: boolean; // 是否上报 API 接口请求
  sendResource: boolean; // 是否上报资源请求
  sendPromise: boolean; // 是否上报未捕获promise异常
  sendPerf: boolean; // 是否上报页面性能
  ignoreApiUrls: string[]; // 忽略的监控的接口地址
}
interface BaseError {
  errorType: ErrorType;
  timeStamp?: number;
}

export interface ResourceError extends BaseError {
  tagName: string;
  filename: string;
}

export interface JsError extends BaseError {
  filename: string;
  message: string;
  position: string;
  stack: string;
}

export interface UnhandlePromiseError extends BaseError {
  filename: string;
  message: string;
  position: string;
  stack: string;
}

export type HandlerParams = 'load' | 'error' | 'abort';
export interface XhrObserver extends BaseError {
  xhrType: HandlerParams;
  pathname: string;
  status: string;
  duration: number;
  response: string;
  queryParams: string;
  bodyParams: any;
}

export enum EVENTTYPES {
  XHR = 'xhr',
  FETCH = 'fetch',
  CLICK = 'click',
  HISTORY = 'history',
  ERROR = 'error',
  HASHCHANGE = 'hashchange',
  UNHANDLEDREJECTION = 'unhandledrejection',
  RESOURCE = 'resource',
  DOM = 'dom',
  VUE = 'vue',
  REACT = 'react',
  CUSTOM = 'custom',
  PERFORMANCE = 'performance',
  RECORDSCREEN = 'recordScreen',
  WHITESCREEN = 'whiteScreen',
}

export interface Callback {
  (...args: any[]): any;
}

export interface ReplaceHandler {
  type: EVENTTYPES;
  callback: Callback;
}

export type voidFun = (...args: any[]) => void;

export type ReplaceCallback = (data: any) => void;

export interface IAnyObject {
  [key: string]: any;
}
