import { initOptions, log, setupReplace } from '@monitor/core';
import { SDK_VERSION, SDK_NAME } from '@monitor/common';
import { InitOptions } from '@monitor/types';

function init(options: InitOptions) {
  if (!options.dsn || !options.apikey) {
    return console.error(`web-monitor 缺少必须配置项：${!options.dsn ? 'dsn' : 'apikey'} `);
  }
  if (options.disabled) return;
  // 初始化配置
  initOptions(options);
  setupReplace();
}

export default {
  SDK_VERSION,
  SDK_NAME,
  init,
  log,
};
