/*
 * @Author: yuzy
 * @Date: 2022-08-05 16:49:19
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-07 18:23:26
 * @Description:
 */
export enum ErrorType {
  JsError = 'jsError',
  UnHandleRejectionError = 'unHandleRejectionError',
  ResourceError = 'resourceError',
  HttpRequestError = 'httpError',
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
