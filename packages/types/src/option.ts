import { BreadcrumbData } from './base';
import { ReportDataType } from './transportData';

// 默认监听的事件
export interface SilentEventTypes {
  /**
   * 静默监控Xhr事件
   */
  silentXhr?: boolean;
  /**
   * 静默监控fetch事件
   */
  silentFetch?: boolean;
  /**
   * 静默监控click事件
   */
  silentClick?: boolean;
  /**
   * 静默监控history事件
   */
  silentHistory?: boolean;
  /**
   * 静默监控error事件
   */
  silentError?: boolean;
  /**
   * 静默监控unhandledrejection事件
   */
  silentUnhandledrejection?: boolean;
  /**
   * 静默监控hashchange事件
   */
  silentHashchange?: boolean;
}

export interface HooksTypes {
  /**
   * 钩子函数，在每次添加用户行为事件前都会调用
   *
   */
  beforePushBreadcrumb?(data: BreadcrumbData): BreadcrumbData;
  /**
   * 钩子函数，在每次发送事件前会调用
   *
   */
  beforeDataReport?(data: ReportDataType): Promise<ReportDataType | boolean>; // 数据上报前的 hook
}

export interface InitOptions extends SilentEventTypes, HooksTypes {
  dsn: string; // 错误监控的dsn服务器地址
  apikey: string; // 每个项目有一个唯一key，给监控的dsn用的
  userId?: string; // 用户id
  disabled?: boolean; // 是否禁用SDK
  debug?: boolean; // 默认未关闭，会打印一些信息
  ignoreApis?: string[]; // 过滤的接口请求
  useImgUpload?: boolean; // 使用img上报的方式，默认为false，默认是xhr的上报方式
  overTime?: number; // 接口超时时长
  maxBreadcrumbs?: number; //  用户行为存放的最大长度
  getUserId?: () => string | number; // 用户定义的
  handleHttpResponse?: (data: any) => boolean; // 处理接口返回的 response
  repeatCodeError?: boolean; // 是否去除重复的代码错误，重复的错误只上报一次
}
