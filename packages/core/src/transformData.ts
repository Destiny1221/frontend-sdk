import { fromHttpStatus, interceptStr, getTimestamp, getLocationHref } from '@monitor/utils';
import { STATUS_CODE, HTTP_CODE } from '@monitor/common';
import { HttpData, ReportDataType, ResourceTarget } from '@monitor/types';
import { options } from './options';

// 处理接口的状态
export function httpTransform(data: HttpData): ReportDataType & {
  statusText: STATUS_CODE;
} {
  let message = '';
  let statusText: STATUS_CODE = STATUS_CODE.ERROR;
  const { url, duration, time, method, type, status = 200, responseText = '', requestData } = data;
  const name = `${type}--${method}`;
  if (status === 0) {
    message = duration <= 1000 ? 'http请求失败，失败原因：跨域限制或域名不存在' : 'http请求失败，失败原因：超时';
  } else if (status < HTTP_CODE.BAD_REQUEST) {
    if (options.handleHttpResponse && typeof options.handleHttpResponse == 'function') {
      if (options.handleHttpResponse(JSON.parse(responseText))) {
        statusText = STATUS_CODE.OK;
      } else {
        statusText = STATUS_CODE.ERROR;
        message = `接口报错，报错信息为：${responseText}`;
      }
    }
  } else {
    statusText = STATUS_CODE.ERROR;
    message = `请求失败，status值为:${status}，${fromHttpStatus(status)}`;
  }
  return {
    type,
    url: getLocationHref(),
    time,
    duration,
    message,
    name,
    statusText,
    request: {
      httpType: type,
      method,
      url: url,
      data: requestData || '',
    },
    response: {
      status,
      data: responseText || '',
    },
  };
}
export function resourceTransform(target: ResourceTarget): ReportDataType {
  return {
    url: getLocationHref(),
    message: '资源地址' + (interceptStr(target.src as string, 120) || interceptStr(target.href as string, 120)),
    time: getTimestamp(),
    name: (target.localName as string) + '加载失败',
  };
}
