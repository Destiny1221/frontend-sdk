/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:12:14
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-04 17:43:32
 * @Description:
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundles.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'), //模版路径
      filename: 'index.html', // 自动生成HTML文件的名称
      favicon: path.resolve(__dirname, 'public/logo.png'), // 设置页面icon
    }),
    //  添加eslint校验
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
      context: path.resolve(__dirname, 'src'),
      exclude: '/node_modules',
      fix: true /* 自动帮助修复 */,
    }),
  ],
  module: {
    rules: [
      {
        test: /.ts$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    open: true,
    host: '127.0.0.1',
    port: '5050',
    watchFiles: ['./index.html'],
  },
};
