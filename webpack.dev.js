/*
 * @Author: yuzy
 * @Date: 2022-08-18 15:55:05
 * @LastEditors: yuzy
 * @LastEditTime: 2022-09-07 17:44:21
 * @Description:
 */
const path = require('path');
//引入webpack-merge插件进行合并
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// 费时分析
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
//引入webpack.base.js文件
const base = require('./webpack.base');
const config = merge(base, {
  entry: path.resolve(__dirname, 'test/index.js'),
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  mode: 'development',
  devServer: {
    static: path.resolve(__dirname, 'public'),
    open: true,
    host: '127.0.0.1',
    port: '5050',
  },
  //启用source-map方便调试
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      // 生成chunk最小体积
      minSize: 20000,
      // 要提取的chunk最少被引用次数
      minChunks: 1,
      //配置提取模块方案
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 2,
          enforce: true,
          reuseExistingChunk: true,
        },
      },
    },
  },
  externals: {
    lodash: 'lodash',
  },
  module: {
    noParse: '/lodash/',
    rules: [
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset',
        // 输出文件位置以及文件名
        generator: {
          // [ext] 自带 "." 这个与 url-loader 配置不同
          filename: 'image/[name][hash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024, //超过50kb不转 base64
          },
        },
      },
      {
        test: /\.(s[ac]|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'example/index.html'), //模版路径
      filename: 'index.html', // 自动生成HTML文件的名称
      favicon: './public/logo.png', // 设置页面icon
      minify: {
        //移除空格
        collapseWhitespace: true,
        //移除注释
        removeComments: true,
      },
    }),
  ],
});
const configWithTimeMeasures = smp.wrap(config);
configWithTimeMeasures.plugins.push(
  new MiniCssExtractPlugin({
    // 添加插件
    filename: '[name].[hash:8].css',
  }),
);
module.exports = configWithTimeMeasures;
