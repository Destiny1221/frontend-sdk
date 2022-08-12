/*
 * @Author: yuzy
 * @Date: 2022-08-12 16:53:46
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-12 17:42:59
 * @Description: 用户行为监控
 * 用户行为特征：PV、UV、热点页面、用户设备、用户行为追踪:进入网站后的一些列操作或者跳转、用户自定义埋点上报等。
 */
// 用户行为类型
// enum MonitorBehaviorType {
//     PI = 'page-information',
//     OI = 'origin-information',
//     RCR = 'router-change-record',
//     CBR = 'click-behavior-record',
//     CDR = 'custom-define-record',
//     HT = 'http-record',
// }

interface PageInformation {
  host: string;
  hostname: string;
  href: string;
  protocol: string;
  origin: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  // 网页标题
  title: string;
  // 浏览器的语种 (eg:zh) ; 这里截取前两位，有需要也可以不截取
  language: string;
  // 用户 userAgent 信息
  userAgent?: string;
  // 屏幕宽高 (eg:1920x1080)  屏幕宽高意为整个显示屏的宽高
  winScreen: string;
  // 文档宽高 (eg:1388x937)   文档宽高意为当前页面显示的实际宽高（有的同学喜欢半屏显示）
  docScreen: string;
}

export class UserBehaviorObserver {
  // private engineInstance: EngineInstance;

  // // 本地暂存数据在 Map 里 （也可以自己用对象来存储）
  // public metrics: UserMetricsStore;

  // public breadcrumbs: BehaviorStore;

  // public customHandler: Function;

  // // 最大行为追踪记录数
  // public maxBehaviorRecords: number;

  // // 允许捕获click事件的DOM标签 eg:button div img canvas
  // clickMountList: Array<string>;

  constructor() {
    //   this.engineInstance = engineInstance;
    //   this.metrics = new UserMetricsStore();
    //   // 限制最大行为追踪记录数为 100，真实场景下需要外部传入自定义;
    //   this.maxBehaviorRecords = 100;
    //   // 初始化行为追踪记录
    //   this.breadcrumbs = new BehaviorStore({ maxBehaviorRecords: this.maxBehaviorRecords });
    //   // 初始化 用户自定义 事件捕获
    //   this.customHandler = this.initCustomerHandler();
    //   // 作为 真实sdk 的时候，需要在初始化时传入与默认值合并;
    //   this.clickMountList = ['button'].map((x) => x.toLowerCase());
    //   // 重写事件
    //   wrHistory();
    // 初始化页面基本信息
    this.initPageInfo();
    // 初始化路由跳转获取
    this.initRouteChange();
    // 初始化用户来路信息获取
    this.initOriginInfo();
    // 初始化 PV 的获取;
    this.initPV();
    // 初始化 click 事件捕获
    //   this.initClickHandler(this.clickMountList);
    // 初始化 Http 请求事件捕获
    this.initHttpHandler();
    // 上报策略在后几篇细说
  }

  // 封装用户行为的上报入口
  userSendHandler = () => {
    // 进行通知内核实例进行上报;
  };

  // 获取 PI 页面基本信息
  getPageInfo = (): PageInformation => {
    const { host, hostname, href, protocol, origin, port, pathname, search, hash } = window.location;
    const { width, height } = window.screen;
    const { language, userAgent } = navigator;

    return {
      host,
      hostname,
      href,
      protocol,
      origin,
      port,
      pathname,
      search,
      hash,
      title: document.title,
      language: language.substr(0, 2),
      userAgent,
      winScreen: `${width}x${height}`,
      docScreen: `${document.documentElement.clientWidth || document.body.clientWidth}x${
        document.documentElement.clientHeight || document.body.clientHeight
      }`,
    };
  };

  // 初始化用户自定义埋点数据的获取上报
  initCustomerHandler = () => {
    //... 详情代码在下文
  };

  // 初始化页面基本信息的获取以及返回
  initPageInfo = (): void => {
    const info: PageInformation = this.getPageInfo();
    window.console.log(info);
  };
  // 补齐 pathname 和 timestamp 参数
  getExtends = (): { page: string; timestamp: number | string } => {
    return {
      page: this.getPageInfo().pathname,
      timestamp: new Date().getTime(),
    };
  };

  // 初始化 RCR 路由跳转的获取以及返回
  initRouteChange = (): void => {
    //... 详情代码在下文
  };

  // 初始化 PV 的获取以及返回
  initPV = (): void => {
    //... 详情代码在下文
  };

  // 初始化 OI 用户来路的获取以及返回
  initOriginInfo = (): void => {
    //... 详情代码在下文
  };

  // 初始化 CBR 点击事件的获取和返回
  initClickHandler = (): void => {
    //... 详情代码在下文
  };

  // 初始化 http 请求的数据获取和上报
  initHttpHandler = (): void => {
    //... 详情代码在下文
  };
}
