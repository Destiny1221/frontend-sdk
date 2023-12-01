import { _support, isBrowserEnv, Queue, getLocationHref, generateUUID, validateOption } from '@monitor/utils';
import { SDK_VERSION } from '@monitor/common';
import { ReportDataType, FinalReportType, InitOptions, AuthInfo } from '@monitor/types';
import { breadcrumb } from './breadcrumb';

/**
 * 用来上报数据，包含图片打点上报、xhr请求
 */
export class TransportData {
  queue: Queue; // 消息队列
  uuid: string; // 每次页面加载的唯一标识
  beforeDataReport: any;
  apikey = '';
  dsn = '';
  userId = '';
  useImgUpload = true;
  constructor() {
    this.queue = new Queue();
    this.uuid = generateUUID(); // 每次页面加载的唯一标识
  }
  beacon(url: string, data: any): boolean {
    console.log(data);
    return true;
    return navigator.sendBeacon(url, JSON.stringify(data));
  }
  imgRequest(data: FinalReportType, url: string): void {
    const requestFun = () => {
      let img: null | HTMLImageElement = new Image();
      const spliceStr = url.indexOf('?') === -1 ? '?' : '&';
      img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
      img = null;
    };
    this.queue.addFn(requestFun);
  }

  async xhrPost(data: FinalReportType, url: string): Promise<void> {
    const requestFun = () => {
      fetch(`${url}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };
    this.queue.addFn(requestFun);
  }

  async beforePost(data: ReportDataType): Promise<FinalReportType | boolean> {
    let transportData = this.getTransportData(data);
    // 配置了beforeDataReport
    if (typeof this.beforeDataReport === 'function') {
      transportData = this.beforeDataReport(transportData);
      if (!transportData) return false;
    }
    return transportData;
  }

  // 获取用户信息
  getAuthInfo(): AuthInfo {
    return {
      userId: this.userId || '',
      sdkVersion: SDK_VERSION,
      apikey: this.apikey,
    };
  }
  // 添加公共信息
  // 这里不要添加时间戳，比如接口报错，发生的时间和上报时间不一致
  getTransportData(data: ReportDataType): FinalReportType {
    const info = {
      data,
      authInfo: this.getAuthInfo(), // 获取用户信息
      uuid: this.uuid,
      pageUrl: getLocationHref(),
      deviceInfo: _support.deviceInfo, // 获取设备信息
    } as FinalReportType;
    info.breadcrumb = breadcrumb.getStack(); // 获取用户行为栈
    return info;
  }
  // 上报数据
  async send(data: ReportDataType) {
    const result = (await this.beforePost(data)) as FinalReportType;
    if (isBrowserEnv && result) {
      // 优先使用sendBeacon 上报，若数据量大，再使用图片打点上报和fetch上报
      const value = this.beacon(this.dsn, result);
      if (!value) {
        return this.useImgUpload ? this.imgRequest(result, this.dsn) : this.xhrPost(result, this.dsn);
      }
    }
  }

  bindOptions(options: InitOptions = {} as InitOptions) {
    this.apikey = this.getValue(options.apikey, 'apikey', 'string', this.apikey);
    this.dsn = this.getValue(options.dsn, 'dsn', 'string', this.dsn);
    this.userId = this.getValue(options.userId, 'userId', 'string', this.userId);
    this.useImgUpload = this.getValue(options.useImgUpload, 'useImgUpload', 'boolean', this.useImgUpload);
    this.beforeDataReport = this.getValue(
      options.beforeDataReport,
      'beforePushBreadcrumb',
      'function',
      this.beforeDataReport,
    );
  }

  getValue(target: any, targetName: string, expectType: string, defaultValue: any) {
    return validateOption(target, targetName, expectType) ? target : defaultValue;
  }
}
const transportData = new TransportData();
export { transportData };
