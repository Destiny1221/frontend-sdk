import { validateOption, _support, setSilentFlag, logger } from '@monitor/utils';
import { InitOptions } from '@monitor/types';
import { breadcrumb } from './breadcrumb';
import { transportData } from './reportData';

export class Options {
  apikey = '';
  dsn = ''; // 监控上报接口的地址
  overTime = 10; // 接口超时时长
  ignoreApis: string[]; // 过滤的接口请求正则
  handleHttpResponse: any; // 处理接口返回的 response
  repeatCodeError = false; // 是否去除重复的代码错误，重复的错误只上报一次
  bindOptions(options: InitOptions): void {
    const { apikey, dsn, ignoreApis, overTime, handleHttpResponse, repeatCodeError } = options;
    this.apikey = this.getValue(apikey, 'apikey', 'string', this.apikey);
    this.dsn = this.getValue(dsn, 'dsn', 'string', this.dsn);
    this.ignoreApis = this.getValue(ignoreApis, 'ignoreApis', 'array', this.ignoreApis);
    this.overTime = this.getValue(overTime, 'overTime', 'number', this.overTime);
    this.handleHttpResponse = this.getValue(
      handleHttpResponse,
      'handleHttpResponse',
      'function',
      this.handleHttpResponse,
    );
    this.repeatCodeError = this.getValue(repeatCodeError, 'repeatCodeError', 'boolean', this.repeatCodeError);
  }
  getValue(target: any, targetName: string, expectType: string, defaultValue: any) {
    return validateOption(target, targetName, expectType) ? target : defaultValue;
  }
}
const options = _support.options || (_support.options = new Options());

export function initOptions(paramOptions: InitOptions): void {
  // setSilentFlag 给全局添加已设置的标识，防止重复设置
  setSilentFlag(paramOptions);
  breadcrumb.bindOptions(paramOptions);
  transportData.bindOptions(paramOptions);
  logger.bindOptions(!!paramOptions?.debug);
  // 绑定其他配置项
  options.bindOptions(paramOptions);
}
export { options };
