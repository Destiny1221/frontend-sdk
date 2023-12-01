/*
 * @Author: yuzy
 * @Date: 2022-07-12 11:16:43
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-26 11:09:03
 * @Description:
 */
import axios from 'axios';

const baseURL = 'https://zht-int.pinlandata.com';
class Request {
  // axios 实例
  instance;
  // 基础配置，url和超时时间
  baseConfig = { baseURL: baseURL, timeout: 60000 };

  constructor() {
    this.instance = axios.create(this.baseConfig);
    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        if (config.headers) {
          config.headers['Content-Type'] = 'application/json;charset=UTF-8';
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    // 响应拦截
    this.instance.interceptors.response.use(
      (response) => {
        const res = response.data;
        const resCode = Number(res.code);
        if (resCode !== 200) {
          return Promise.reject(new Error(res.msg || res.message || 'Error'));
        }
        return res;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  get(url, config) {
    return this.instance.get(url, config);
  }

  post(url, data, config) {
    return this.instance.post(url, data, config);
  }
}

const request = new Request();

export const getList = () => request.get('/drawing_show/get_version?name=jack');
