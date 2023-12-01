import ErrorStackParser from 'error-stack-parser';
import { transportData } from './reportData';
import { breadcrumb } from './breadcrumb';
import { EVENTTYPES } from '@monitor/common';
import { isError, getTimestamp, unknownToString, getLocationHref } from '@monitor/utils';
import { ReportDataType } from '@monitor/types';

// 自定义上报事件
export function log({ message = 'customMsg', error = '', type = EVENTTYPES.CUSTOM }: any): void {
  let errorInfo: Record<string, any> = {
    url: getLocationHref(),
  };
  if (isError(error)) {
    const result = ErrorStackParser.parse(!error.target ? error : error.error || error.reason)[0];
    errorInfo = { ...result, line: result.lineNumber, column: result.columnNumber };
  }
  breadcrumb.push({
    type,
    data: unknownToString(message),
    time: getTimestamp(),
  });
  transportData.send({
    type,
    message: unknownToString(message),
    time: getTimestamp(),
    ...errorInfo,
  } as ReportDataType);
}
