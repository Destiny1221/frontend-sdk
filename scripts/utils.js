const fs = require('fs');
const chalk = import('chalk').then((m) => m.default);
const minimist = require('minimist');
const path = require('path');

exports.targets = fs.readdirSync('packages').filter((f) => {
  // 过滤掉非目录文件
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false;
  }
  const pkg = require(`../packages/${f}/package.json`);
  // 过滤掉私有包和不带编译配置的包
  if (pkg.private && !pkg.buildOptions) {
    return false;
  }
  return true;
});

exports.getArgv = () => {
  var argv = minimist(process.argv.slice(2));
  return argv;
};

exports.binRun = async (bin, args, opts = {}) => {
  const { execa } = await import('execa');
  await execa(bin, args, { stdio: 'inherit', ...opts });
};

exports.getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg);

exports.step = async (msg) => {
  const _chalk = await chalk;
  console.log(_chalk.cyan(msg));
};

exports.errLog = async (msg) => {
  const _chalk = await chalk;
  console.log(_chalk.red(msg));
};

exports.successLog = async (msg) => {
  const _chalk = await chalk;
  console.log(_chalk.green(msg));
};
