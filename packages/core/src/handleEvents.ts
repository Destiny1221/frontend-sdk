import ErrorStackParser from 'error-stack-parser';
import { transportData, breadcrumb, resourceTransform, httpTransform, options } from './index';
import { EVENTTYPES, STATUS_CODE, BREADCRUMBTYPES } from '@monitor/common';
import {
  getErrorUid,
  hashMapExist,
  getTimestamp,
  unknownToString,
  isError,
  parseUrlToObj,
  getLocationHref,
} from '@monitor/utils';
import { ResourceTarget, HttpData, ReportDataType } from '@monitor/types';

const HandleEvents = {
  handleError(ev: ErrorEvent): void | Promise<void> {
    const target = ev.target;
    // Tip: 也可以使用 ev instanceof ErrorEvent 来判断是否属于资源异常还是脚本异常，资源异常情况下返回false
    // 资源加载报错
    if ((target as ResourceTarget).localName) {
      // 提取资源加载的信息
      const data = resourceTransform(target as ResourceTarget);
      breadcrumb.push({
        type: BREADCRUMBTYPES.RESOURCE,
        time: getTimestamp(),
        data,
      });
      return transportData.send({
        ...data,
        type: EVENTTYPES.RESOURCE,
      });
    }
    // code error
    /**
     * TODO:待验证跨站脚本异常是否可以捕获？
     * 初始化跨域脚本异常
     * 这种错误我们平时很少能够遇到，比如说当我们在index.html中引用的不是同一域下的错误脚本
     * <script async src="http://127.0.0.1:3000/error.js"> </script>
     * 我们在控制台能够发现有具体的报错信息，但是event.message值却是"Script error.",并且无法获取错误行数、列数、文件名等信息。
     *
     * 这是浏览器的安全机制造成的：当跨域加载的脚本中发生语法错误时，浏览器出于安全考虑，不会报告错误的细节，而只报告简单的
     * Script error。浏览器只允许同域下的脚本捕获具体错误信息，而其他脚本只知道发生了一个错误，但无法获知错误的具体内容
     * （控制台仍然可以看到，但是JS脚本无法捕获）
     *
     * 处理：对于第三方脚本错误，我们捕获或者不捕获都是可以的，如果捕获的话，只需要上报类型即可。
     * 补充：我们如何捕获跨域脚本错误详情呢，只需要开启跨域资源共享CORS。
     *  1. 添加crossorigin="anonymous"属性
     *     <script async src="http://localhost:3000/error.js" crossorigin="anonymous"></script>
     *  2. 添加跨域HTTP响应头
     *     Access-Control-Allow-Origin: *
     *  通过上面两个步骤，我们就能正常捕获JS异常了。
     */
    const stackFrame = ErrorStackParser.parse(!target ? ev : ev.error)[0];
    const { fileName, columnNumber, lineNumber } = stackFrame;
    const errorData = {
      type: EVENTTYPES.ERROR,
      time: getTimestamp(),
      message: ev.message,
      fileName,
      line: lineNumber,
      column: columnNumber,
      url: getLocationHref(),
    };
    breadcrumb.push({
      type: BREADCRUMBTYPES.CODEERROR,
      data: errorData,
      time: getTimestamp(),
    });
    const hash = getErrorUid(`${EVENTTYPES.ERROR}-${ev.message}-${fileName}-${columnNumber}`);
    // 开启repeatCodeError第一次报错才上报
    if (!options.repeatCodeError || (options.repeatCodeError && !hashMapExist(hash))) {
      transportData.send(errorData);
    }
  },
  handleUnhandleRejection(ev: PromiseRejectionEvent): void {
    let data: ReportDataType = {
      type: EVENTTYPES.UNHANDLEDREJECTION,
      time: getTimestamp(),
      message: unknownToString(isError(ev.reason) ? ev.reason.message : ev.reason),
      url: getLocationHref(),
    };
    // 需要判断promise的reject函数抛出的是否是一个错误对象，因为不是错误对象是获取不到错误栈的
    if (isError(ev.reason)) {
      const stackFrame = ErrorStackParser.parse(ev.reason)[0];
      const { fileName, columnNumber, lineNumber } = stackFrame;
      data = {
        ...data,
        fileName,
        line: lineNumber,
        column: columnNumber,
      };
    }
    breadcrumb.push({
      type: BREADCRUMBTYPES.UNHANDLEDREJECTION,
      time: getTimestamp(),
      data,
    });
    const hash: string = getErrorUid(`${EVENTTYPES.UNHANDLEDREJECTION}-${data.message}`);
    // 开启repeatCodeError第一次报错才上报
    if (!options.repeatCodeError || (options.repeatCodeError && !hashMapExist(hash))) {
      transportData.send(data);
    }
  },
  handleHttp(data: HttpData, type: EVENTTYPES): void {
    const result = httpTransform(data);
    // 添加用户行为，去掉自身上报的接口行为
    if (!data.url.includes(options.dsn)) {
      breadcrumb.push({
        type: BREADCRUMBTYPES.XHR,
        data: result,
        time: data.time,
      });
    }

    if (result.statusText === STATUS_CODE.ERROR) {
      // 上报接口错误
      transportData.send({ ...result, type });
    }
  },
  handleHashchange(data: HashChangeEvent): void {
    const { oldURL, newURL } = data;
    const { relative: from } = parseUrlToObj(oldURL);
    const { relative: to } = parseUrlToObj(newURL);
    breadcrumb.push({
      type: BREADCRUMBTYPES.ROUTE,
      data: {
        from,
        to,
      },
      time: getTimestamp(),
    });
  },
  handleHistory(data: { to: string; from: string }): void {
    const { from, to } = data;
    const { relative: parsedFrom } = parseUrlToObj(from);
    const { relative: parsedTo } = parseUrlToObj(to);
    breadcrumb.push({
      type: BREADCRUMBTYPES.ROUTE,
      data: {
        from: parsedFrom ? parsedFrom : '/',
        to: parsedTo ? parsedTo : '/',
      },
      time: getTimestamp(),
    });
  },
};
export { HandleEvents };
