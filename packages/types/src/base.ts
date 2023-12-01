import { EVENTTYPES, STATUS_CODE, BREADCRUMBTYPES, EMethods } from '@monitor/common';

// Without将T中不包含U的属性 设置为可选属性
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

// 将T U 变成互斥的，至少有其中一个
export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

/**
 * http请求
 */
export interface HttpData {
  type: EVENTTYPES.XHR | EVENTTYPES.FETCH;
  method: EMethods;
  time: number;
  url: string; // 接口地址
  duration: number; // 接口时长
  message: string; // 接口信息
  status?: number; // 接口状态
  requestData?: {
    data: any;
  };
  responseText?: string;
}

/**
 * 代码错误
 */
export interface CodeError {
  column?: number;
  line?: number;
  fileName?: string;
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  browserVersion: any; // 版本号
  browser: any; // Chrome
  osVersion: any; // 电脑系统 10
  os: string; // 设备系统
  ua: string; // 设备详情
  device: string; // 设备种类描述
  device_type: string; // 设备种类，如pc
}

export interface Callback {
  (...args: any[]): any;
}
export interface IAnyObject {
  [key: string]: any;
}

export type voidFun = (...args: any[]) => void;

export interface ReplaceHandler {
  type: EVENTTYPES;
  callback: Callback;
}

export type ReplaceCallback = (data: any) => void;

export interface ResourceTarget {
  src?: string;
  href?: string;
  localName?: string;
}

// 用户信息
export interface AuthInfo {
  apikey: string;
  sdkVersion: string;
  userId?: string;
}

export interface BreadcrumbData {
  type: BREADCRUMBTYPES; // 用户行为类型
  data: any;
  time: number; // 发生时间
}

export interface RouteHistory {
  from: string;
  to: string;
}
