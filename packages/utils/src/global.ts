import { UAParser } from 'ua-parser-js';
import { variableTypeDetection } from './verifyType';
import { DeviceInfo } from '@monitor/types';
import { Breadcrumb, Options, TransportData } from '@monitor/core';
import { EVENTTYPES } from '@monitor/common';
import { Logger } from './logger';

// MITO的全局变量
export interface MitoSupport {
  logger: Logger;
  breadcrumb: Breadcrumb;
  transportData: TransportData;
  replaceFlag: { [key in EVENTTYPES]?: boolean };
  record?: any[];
  deviceInfo?: DeviceInfo;
  options?: Options;
  track?: any;
  errorMap?: Map<string, boolean>;
  // [key: string]: any;
}

export const isBrowserEnv = variableTypeDetection.isWindow(typeof window !== 'undefined' ? window : 0);

export const isNodeEnv = variableTypeDetection.isProcess(typeof process !== 'undefined' ? process : 0);

// 获取全局对象
function getGlobal() {
  return globalThis;
}
const _global = getGlobal();

// 获取全部变量__MITO__的引用地址
function getGlobalSupport(): MitoSupport {
  (_global as any).__MITO__ = (_global as any).__MITO__ || ({} as MitoSupport);
  return (_global as any).__MITO__;
}

const _support = getGlobalSupport();
const uaResult = new UAParser().getResult();

// 获取设备信息
_support.deviceInfo = {
  browserVersion: uaResult.browser.version, // // 浏览器版本号 107.0.0.0
  browser: uaResult.browser.name, // 浏览器类型 Chrome
  osVersion: uaResult.os.version, // 操作系统 电脑系统 10
  os: uaResult.os.name as string, // Windows
  ua: uaResult.ua,
  device: uaResult.device.model ? uaResult.device.model : 'Unknow',
  device_type: uaResult.device.type ? uaResult.device.type : 'Pc',
};

// errorMap 存储代码错误的集合，用来收集代码错误信息生成唯一id，防止重复上报错误
_support.errorMap = new Map();

_support.replaceFlag = _support.replaceFlag || {};
const replaceFlag = _support.replaceFlag;
export function setFlag(replaceType: EVENTTYPES, isSet: boolean) {
  if (replaceFlag[replaceType]) return;
  replaceFlag[replaceType] = isSet;
}
export function getFlag(replaceType: EVENTTYPES) {
  return replaceFlag[replaceType] ? true : false;
}

export function supportsHistory(): boolean {
  const chrome = (_global as any).chrome;
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
  const hasHistoryApi =
    'history' in _global && !!(_global.history as History).pushState && !!(_global.history as History).replaceState;
  return !isChromePackagedApp && hasHistoryApi;
}

export { _global, _support };
