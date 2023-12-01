const path = require('path');
//引入webpack-merge插件进行合并
const { merge } = require('webpack-merge');
//引入webpack.base.js文件
const base = require('./webpack.base');
const { targets } = require('./scripts/utils');

module.exports = function () {
  return targets.map((target) => {
    return merge(base, {
      entry: path.resolve(__dirname, 'packages', target, 'src/index.ts'),
      name: target,
      output: {
        clean: true,
        path: path.resolve(__dirname, 'packages', target, 'dist'),
        filename: `${target}.js`,
        library: {
          name: 'monitior',
          type: 'umd',
        },
      },
      //模块参数
      mode: 'production',
    });
  });
};
