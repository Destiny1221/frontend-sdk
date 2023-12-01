import { EVENTTYPES } from '@monitor/common';
import { AuthInfo, DeviceInfo, BreadcrumbData, CodeError } from './base';

export interface ReportDataType extends CodeError {
  type?: EVENTTYPES;
  message?: string;
  // 页面地址
  url: string;
  // 资源加载异常时资源类型
  name?: string;
  // 时间戳
  time?: number;
  // ajax
  duration?: number;
  request?: {
    httpType?: string;
    method: string;
    url: string;
    data: any;
  };
  response?: {
    status: number;
    data: string;
  };
}

export type FinalReportType = {
  data?: ReportDataType;
  authInfo?: AuthInfo;
  deviceInfo?: DeviceInfo;
  breadcrumb?: BreadcrumbData[];
  pageUrl?: string;
  uuid?: string;
};
