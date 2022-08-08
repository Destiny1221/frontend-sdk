/*
 * @Author: yuzy
 * @Date: 2022-08-05 16:49:19
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 17:18:53
 * @Description:
 */
export enum ErrorType {
  JsError = 'jsError',
  UnHandleRejectionError = 'unHandleRejectionError',
  ResourceError = 'resourceError',
  AjaxRequestError = 'xhr',
}
export interface InitOptions {
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
