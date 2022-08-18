/*
 * @Author: yuzy
 * @Date: 2022-08-18 15:49:46
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-18 16:14:44
 * @Description:
 */
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

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
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
