/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:22:12
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-05 18:20:56
 * @Description:
 */
import { ErrorObserver } from '@/lib/errorObserver';
import { PromiseErrorObserver } from '@/lib/promiseErrorOberver';
class Monitor {
  public static instance: Monitor;
  constructor() {
    this.initObserver();
  }
  /**
   * @description: 初始化Monitor实例，单例模式
   * @return {*}
   */
  static init() {
    if (!this.instance) {
      this.instance = new Monitor();
    }
    return this.instance;
  }
  /**
   * @description: 初始化所有错误实例
   * @return {*}
   */
  initObserver() {
    new ErrorObserver();
    new PromiseErrorObserver();
  }
}

new Monitor();

document.getElementById('errorBtn').onclick = () => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '111.js';
  document.body.appendChild(script);
};

document.getElementById('errorImgBtn').onclick = () => {
  const img = document.createElement('img');
  img.src = '111.jpg';
  document.querySelector('.content').appendChild(img);
};

document.getElementById('errorStyleBtn').onclick = () => {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = '111.css';
  document.getElementsByTagName('head')[0].appendChild(link);
};

document.getElementById('errorScriptBtn').onclick = () => {
  let name;
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  name.url = 11;
};
document.getElementById('errorPromiseBtn').onclick = () => {
  const fn = () => {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 1000, { name: 'jack' });
    });
  };
  fn();
};
