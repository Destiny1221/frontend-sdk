/*
 * @Author: yuzy
 * @Date: 2022-08-12 16:52:25
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-30 14:45:09
 * @Description: 性能监控
 * 网站的性能情况其实是相对的，当网速快设备强大的情况下对于用户来说速度很快，当网速慢设备低端的情况下对于用户来说速度较慢
 * 因此需要一个具体的数值指标来衡量我们网站的性能。所以性能监控就是将这些性能指标量化收集。
 * 为了帮助我们更好的衡量和改进前端性能，W3C性能小组帮助开发者使用window.performance属性获取网站性能参数。
 *
 * 第三方插件web-vitals：是一个google开源的衡量性能和用户体验的工具，相比于自己手动写，它会替我们覆盖很多兼容和特殊的场景。
 */
import { getFCP, getLCP, getFID, getCLS } from 'web-vitals';
import {
  afterLoad,
  getFP as getFPCustom,
  getFCP as getFCPCustom,
  getFMP,
  getLCP as getLCPCustom,
  getFID as getFIDCustom,
  getNavigationTiming,
} from '@/utils/index';
export class WebVitals {
  constructor() {
    this.initLCP();
    this.initCLS();
    this.initResourceFlow();

    // 这里的 FP/FCP/FID需要在页面成功加载了再进行获取
    afterLoad(() => {
      this.initNavigationTiming();
      this.initFP();
      this.initFCP();
      this.initFMP();
      this.initFID();
      this.perfSendHandler();
    });
  }

  // 性能数据的上报策略
  perfSendHandler = (): void => {
    // 如果你要监听 FID 数据。你就需要等待 FID 参数捕获完成后进行上报;
    // 如果不需要监听 FID，那么这里你就可以发起上报请求了;
  };

  // 初始化 FP 的获取以及返回
  initFP = (): void => {
    getFPCustom(console.log);
  };

  // 初始化 FCP 的获取以及返回
  initFCP = (): void => {
    getFCP(console.log);
    getFCPCustom(console.log);
  };
  // 初始化 FMP 的获取以及返回
  initFMP = (): void => {
    getFMP(console.log);
  };
  // 初始化 LCP 的获取以及返回
  initLCP = (): void => {
    getLCP(console.log);
    getLCPCustom(console.log);
  };

  // 初始化 FID 的获取 及返回
  initFID = (): void => {
    getFID(console.log);
    getFIDCustom((entry: PerformanceEventTiming) => {
      window.console.log('FID:', entry.processingStart - entry.startTime);
    });
  };

  // 初始化 CLS 的获取以及返回
  initCLS = (): void => {
    getCLS(console.log);
  };

  // 初始化 NT 的获取以及返回
  initNavigationTiming = (): void => {
    const navigationTiming = getNavigationTiming();
    window.console.log('navigationTiming', navigationTiming);
  };

  // 初始化获取每次加载访问的静态资源，找出静态资源加载时间过长问题所在
  initResourceFlow = (): void => {
    const resource = performance.getEntriesByType('resource');
    const formatResourceArray = resource.map((item) => {
      return {
        name: item.name, //资源地址
        startTime: item.startTime, //开始时间
        responseEnd: item.responseEnd, //结束时间
        time: item.duration, //消耗时间
        initiatorType: item.initiatorType, //资源类型
        transferSize: item.transferSize, //传输大小
        //请求响应耗时 ttfb = item.responseStart - item.startTime
        //内容下载耗时 tran = item.responseEnd - item.responseStart
        //但是受到跨域资源影响。除非资源设置允许获取timing
      };
    });
    window.console.log('静态资源加载性能监控:', formatResourceArray);
  };
}
