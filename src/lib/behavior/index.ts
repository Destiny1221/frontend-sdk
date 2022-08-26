/*
 * @Author: yuzy
 * @Date: 2022-08-12 16:53:46
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-26 11:06:34
 * @Description: 用户行为监控
 * 用户行为特征：PV、UV、热点页面、用户设备、用户行为追踪:进入网站后的一些列操作或者跳转、用户自定义埋点上报等。
 */
import { wrHistory, proxyHash, proxyHistory, getOriginInfo } from '@/utils/index';
import type { OriginInformation, httpMetrics } from '@/utils/index';
import { BehaviorStore } from './behaviorStore';

// 这里参考了 谷歌GA 的自定义埋点上报数据维度结构
interface customAnalyticsData {
  // 事件类别 互动的对象 eg:Video
  eventCategory: string;
  // 事件动作 互动动作方式 eg:play
  eventAction: string;
  // 事件标签 对事件进行分类 eg:
  eventLabel: string;
  // 事件值 与事件相关的数值   eg:180min
  eventValue?: string;
}

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

  public breadcrumbs: InstanceType<typeof BehaviorStore>;

  // public customHandler: Function;

  // 允许捕获click事件的DOM标签 eg:button div img canvas
  clickMountList: Array<string>;

  constructor() {
    //   this.engineInstance = engineInstance;
    //   this.metrics = new UserMetricsStore();
    // 初始化行为追踪记录
    this.breadcrumbs = new BehaviorStore({ maxBehaviorRecords: 100 });
    //   // 初始化 用户自定义 事件捕获
    //   this.customHandler = this.initCustomerHandler();
    // 作为 真实sdk 的时候，需要在初始化时传入与默认值合并;
    this.clickMountList = ['button'].map((x) => x.toLowerCase());

    // 重写history事件,为pushState和replaceState派发新的event，用来监听事件
    wrHistory();
    // 初始化页面基本信息
    this.initPageInfo();
    // 初始化路由跳转获取
    this.initRouteChange();
    // 初始化用户来路信息获取
    this.initOriginInfo();
    // 初始化 PV 的获取;
    this.initPV();
    // 初始化 click 事件捕获
    this.initClickHandler(this.clickMountList);
    // 初始化 Http 请求事件捕获
    // this.initHttpHandler();
  }

  /**
   * 封装用户行为上报
   * 用户行为记录栈：我们需要去获取用户的行为追踪记录(用户打开了我们网站，看了什么，点击了什么)，主要追踪以下事件
   * 路由跳转行为
   * 点击行为
   * ajax请求行为
   * 用户自定义事件
   */
  userSendHandler = () => {
    // 进行通知内核实例进行上报;
  };

  /**
   * 获取页面基本信息
   * 包括：当前访问的网页路径、浏览器语种、屏幕大小等。
   * @returns
   */
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

  /**
   * 用户自定义埋点，就是SDK内部暴露出接口供项目方使用，这样用户可以在任意时间段内去调用接口，然后在服务端
   * 进行数据的归类分析，这里主要是数据结构的定义
   */
  initCustomerHandler = () => {
    const handler = (options: customAnalyticsData) => {
      //TODO: 自定义埋点的信息一般立即上报
      //TODO: 记录到用户行为记录栈
      window.console.log('用户自定义埋点', options);
    };
    return handler;
  };

  // 初始化页面基本信息的获取以及返回
  initPageInfo = (): void => {
    const info: PageInformation = this.getPageInfo();
    window.console.log('页面基本信息:', info);
  };
  // 补齐 pathname 和 timestamp 参数
  getExtends = (): { page: string; timestamp: number | string } => {
    return {
      page: this.getPageInfo().pathname,
      timestamp: new Date().getTime(),
    };
  };

  /**
   * 路由跳转行为初始化
   * 一般的路由跳转都是针对于SPA页面的，对于非单应用来说，url的跳转都是页面刷新的形式。
   * 首先了解一下H5中的History API，它所支持的API有以下5个
   * history.back()
   * history.go()
   * history.forward()
   * history.pushState()
   * history.replaceState()
   *
   * 同时History API中还有一个事件，该事件为popstate，它有以下特点：
   * history.back()、history.forward()、history.go()在被调用时，会触发popstate事件
   * history.pushState()、history.replaceState()不会触发popstate事件
   *
   * 补充：Vue中两种路由方式：hash模式和history模式。hash模式主要是通过location.hash跳转路由，监听hashchange事件
   * history模式主要是利用history.pushState跳转路由
   *
   */
  initRouteChange = (): void => {
    const handler = (e: Event) => {
      // 正常记录
      const metrics = {
        // 跳转的方法 eg:replaceState
        jumpType: e.type,
        // 创建时间
        timestamp: new Date().getTime(),
        // 页面信息
        pageInfo: this.getPageInfo(),
      };
      window.console.log('路由跳转:', metrics);
    };
    proxyHash(handler);
    // 为 pushState 以及 replaceState 方法添加 Event 事件
    proxyHistory(handler);
  };

  /**
   * PV、UV
   * PV是页面访问量：只需要在用户每次进入页面的时候，进行上报即可，SPA页面结合上面的路由跳转行为处理。
   * UV是24小时内访问的独立用户数，UV一般由服务器来进行采集，根据请求IP地址收集
   */
  initPV = (): void => {
    const handler = () => {
      const metrics = {
        // 还有一些标识用户身份的信息，由项目使用方传入，任意拓展 eg:userId
        // 创建时间
        timestamp: new Date().getTime(),
        // 页面信息
        pageInfo: this.getPageInfo(),
        // 用户来路
        originInformation: getOriginInfo(),
      };
      window.console.log('PV', metrics);
      // TODO: PV上报服务
      // 一般来说， PV 可以立即上报
    };
    proxyHash(handler);
    proxyHistory(handler);
  };

  /**
   * 用户访问来路
   * 有的时候出现新用户流量，以及线上环境出现404访问情况，需要知道用户是访问了哪个页面才跳转过来的，这时候就需要收集访问来路了
   * 原理就是获取document.referrer 以及window.performance.navigation.type
   */
  initOriginInfo = (): void => {
    const info: OriginInformation = getOriginInfo();
    window.console.log(info);
  };

  /**
   * 初始化点击事件的获取和返回
   * 如果我们能捕获用户点击行为，是能够得到一些非常具有价值的指标数据的，当然我们也不需要获取用户所有的点击，里面会包含很多无意义的点击行为，
   * 因此需要进行一定的过滤，过滤可以根据标签、id、class等进行过滤。
   */
  initClickHandler = (mountList: Array<string>): void => {
    const handler = (e: MouseEvent | any) => {
      // 这里是根据 tagName 进行是否需要捕获事件的依据，可以根据自己的需要，额外判断id\class等
      // 先判断浏览器支持 e.path ，从 path 里先取
      let target = e.path?.find((x: Element) => mountList.includes(x.tagName?.toLowerCase()));
      // 不支持 path 就再判断 target
      target = target || (mountList.includes(e.target.tagName?.toLowerCase()) ? e.target : undefined);
      if (!target) return;
      const metrics = {
        tagInfo: {
          id: target.id,
          classList: Array.from(target.classList),
          tagName: target.tagName,
          text: target.textContent,
        },
        // 创建时间
        timestamp: new Date().getTime(),
        // 页面信息
        pageInfo: this.getPageInfo(),
      };
      // 除开商城业务外，一般不会特意上报点击行为的数据，都是作为辅助检查错误的数据存在;
      window.console.log('用户点击行为:', metrics);
    };
    // 如果我们想捕获input、keydown等事件也是类似的写法，可以自行拓展。
    window.addEventListener(
      'click',
      (e) => {
        handler(e);
      },
      true,
    );
  };

  /**
   * 初始化http请求的数据获取和上报，现在的异步请求底层原理都是调用XMLHttpRequest或者Fetch，因此需要对着两个方法进行劫持。
   */
  initHttpHandler = (): void => {
    const loadHandler = (metrics: httpMetrics) => {
      if (metrics.status < 400) {
        // 对于正常请求的 HTTP 请求来说,不需要记录 请求体 和 响应体
        delete metrics.response;
        delete metrics.body;
      }
      // 记录到用户行为记录栈
    };
    window.console.log(loadHandler);
    // proxyXmlHttp(null, loadHandler);
    // proxyFetch(null, loadHandler);
  };
}
