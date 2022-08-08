/*
 * @Author: yuzy
 * @Date: 2022-08-03 11:12:14
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 15:47:49
 * @Description:
 */
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
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
