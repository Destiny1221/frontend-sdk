/*
 * @Author: yuzy
 * @Date: 2022-08-18 15:56:03
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-18 16:36:12
 * @Description:
 */
const path = require('path');
//引入webpack-merge插件进行合并
const { merge } = require('webpack-merge');
//引入webpack.base.js文件
const base = require('./webpack.base');
module.exports = merge(base, {
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: 'monitior',
      type: 'umd',
    },
  },
  //模块参数
  mode: 'production',
});
