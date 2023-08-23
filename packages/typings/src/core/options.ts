export interface InitOptionsTyping {
  // 是否上报js错误
  sendError: boolean;
  sendPV: boolean; // 是否上报页面 PV
  sendApi: boolean; // 是否上报 API 接口请求
  sendResource: boolean; // 是否上报资源请求
  sendPromise: boolean; // 是否上报未捕获promise异常
  sendPerf: boolean; // 是否上报页面性能
  ignoreApiUrls: string[]; // 忽略的监控的接口地址
}
