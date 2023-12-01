const fs = require('fs');
const path = require('path');

const { getArgv, targets: allTargets, binRun, getPkgRoot, step, errLog, successLog } = require('./utils');
const MITO_PREFIX = '@monitor';

run();

async function run() {
  const argv = getArgv()._;
  let targetVersion = null;
  if (argv.length === 0) {
    return await errLog('\nnpm run version 没有带版本号');
  } else {
    targetVersion = argv.shift();
  }
  const masterVersion = require('../package.json').version;
  if (masterVersion !== targetVersion) {
    return await errLog('\n传入的版本号与masterVersion不一致');
  }
  modify(targetVersion);
}

async function modify(targetVersion) {
  await step(`\nstart modify packages version: ${targetVersion}`);
  for (const target of allTargets) {
    await modifyMitoVersion(target, targetVersion);
  }
}

async function modifyMitoVersion(pkgName, version) {
  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = require(pkgPath);
  const oldVersion = pkg.version;
  if (pkg.name.startsWith(MITO_PREFIX)) {
    pkg.version = version;
  }
  const dependencies = pkg.dependencies || {};
  Object.entries(dependencies).forEach(([dependent]) => {
    if (dependent.startsWith(MITO_PREFIX)) {
      dependencies[dependent] = version;
    }
  });
  fs.writeFileSync(pkgPath, JSON.stringify(pkg));
  await binRun('prettier', ['--write', pkgPath]);
  await successLog(`\n${pkgName} from ${oldVersion} upgrade ${version} success`);
}
