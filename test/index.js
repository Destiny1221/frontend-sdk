/*
 * @Author: yuzy
 * @Date: 2022-08-11 17:10:56
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-30 11:12:10
 * @Description:
 */
import Monitor from '../packages/web/src/index';
import { getList } from './request';

var tag = 'console开始展开';
console.groupCollapsed(tag);
console.log(1);
console.log(1);
console.log(1);
console.groupEnd();

Monitor.init({
  apikey: 'test',
  dsn: 'http://127.0.0.1',
  debug: true,
  maxBreadcrumbs: 2,
  handleHttpResponse: (data) => {
    return data?.code === 200;
  },
});
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
  var name;
  name.url = 123;
};
document.getElementById('errorPromiseBtn').onclick = () => {
  const fn = () => {
    return new Promise((resolve, reject) => {
      setTimeout(reject, 1000, 'myerror');
    });
  };
  fn();
};

document.getElementById('xhrBtn').onclick = () => {
  getList();
};
