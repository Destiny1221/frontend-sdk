/*
 * @Author: yuzy
 * @Date: 2022-08-18 15:49:46
 * @LastEditors: yuzy
 * @LastEditTime: 2022-09-07 17:15:50
 * @Description:
 */
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  resolve: {
    extensions: ['*', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  plugins: [
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
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }, 'ts-loader'],
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',  // 不启动展示打包报告的http服务器，默认值为server启动http服务器
      analyzerHost: '127.0.0.1', // 服务器启动地址
      analyzerPort: 8888, // 端口号
      generateStatsFile: true, // 是否生成stats.json文件
    }),
  ],
};
