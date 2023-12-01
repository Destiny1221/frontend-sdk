import { validateOption, getTimestamp } from '@monitor/utils';
import { BreadcrumbData, InitOptions } from '@monitor/types';

export class Breadcrumb {
  maxBreadcrumbs = 10;
  beforePushBreadcrumb: unknown = null;
  stack: BreadcrumbData[];
  constructor() {
    this.stack = [];
  }
  /**
   * 添加用户行为栈
   */
  push(data: BreadcrumbData): void {
    if (typeof this.beforePushBreadcrumb === 'function') {
      // 执行用户自定义的hook
      const result = this.beforePushBreadcrumb(data) as BreadcrumbData;
      if (!result) return;
      this.immediatePush(result);
      return;
    }
    this.immediatePush(data);
  }
  immediatePush(data: BreadcrumbData): void {
    data.time || (data.time = getTimestamp());
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift();
    }
    this.stack.push(data);
    this.stack.sort((a, b) => a.time - b.time);
  }
  shift(): boolean {
    return this.stack.shift() !== undefined;
  }
  clear(): void {
    this.stack = [];
  }
  getStack(): BreadcrumbData[] {
    return this.stack;
  }

  bindOptions(options: InitOptions = {} as InitOptions) {
    this.maxBreadcrumbs = this.getValue(options.maxBreadcrumbs, 'maxBreadcrumbs', 'number', this.maxBreadcrumbs);
    this.beforePushBreadcrumb = this.getValue(
      options.beforePushBreadcrumb,
      'beforePushBreadcrumb',
      'function',
      this.beforePushBreadcrumb,
    );
  }

  getValue(target: any, targetName: string, expectType: string, defaultValue: any) {
    return validateOption(target, targetName, expectType) ? target : defaultValue;
  }
}
const breadcrumb = new Breadcrumb();
export { breadcrumb };
