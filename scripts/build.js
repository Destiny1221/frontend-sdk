const path = require('path');
const { targets: allTargets, getArgv, getPkgRoot, binRun, step, successLog } = require('./utils');

run();

function run() {
  const argv = getArgv();
  // 打包哪个仓库 npm run build web
  const paramTargetList = argv._;
  if (paramTargetList.length) {
    buildAll(paramTargetList);
  } else {
    buildAll(allTargets);
  }
}

// 同步编译多个包时，为了不影响编译性能，我们需要控制并发的个数，这里我们暂定并发数为4
async function buildAll(targets, maxConcurrency = 4) {
  const ret = [];
  const executing = [];
  for (const item of targets) {
    // 依次对子包执行build()操作
    const p = Promise.resolve().then(() => build(item));
    ret.push(p);

    if (maxConcurrency <= targets.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

/**
 *
 * @param {*} target packages下的文件夹名称
 */
async function build(target) {
  await step(`开始打包${target}`);
  // 获取当前文件夹下的package.json内容
  const pkg = require(path.resolve(getPkgRoot(target), './package.json'));
  if (pkg.private) {
    return;
  }
  const args = ['--config-name', `${target}`, '--progress'];
  await binRun('webpack', args);
  await successLog(`${target}打包成功`);
}
