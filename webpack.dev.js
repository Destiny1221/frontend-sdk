/*
 * @Author: yuzy
 * @Date: 2022-08-18 15:55:05
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-18 16:32:16
 * @Description:
 */
const path = require('path');
//引入webpack-merge插件进行合并
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//引入webpack.base.js文件
const base = require('./webpack.base');
module.exports = merge(base, {
  entry: path.resolve(__dirname, 'test/index.js'),
  mode: 'development',
  devServer: {
    open: true,
    host: '127.0.0.1',
    port: '5050',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'example/index.html'), //模版路径
      filename: 'index.html', // 自动生成HTML文件的名称
      favicon: './public/logo.png', // 设置页面icon
    }),
  ],
  //启用source-map方便调试
  devtool: 'source-map',
});
