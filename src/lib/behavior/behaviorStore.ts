/*
 * @Author: yuzy
 * @Date: 2022-08-22 16:15:10
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-22 18:07:15
 * @Description: 用户行为追踪栈
 * 有时候我们需要知道用户打开了我们网站之后，看了什么点击了什么，需要对特定事件进行追踪
 * 主要包括以下事件：
 *  路由跳转行为
 *  点击行为
 *  ajax请求行为
 *  用户自定义事件
 */
export interface behaviorRecordsOptions {
  maxBehaviorRecords: number;
}

export interface behaviorStack {
  name: string;
  page: string;
  timestamp: number | string;
  value: unknown;
}

// 暂存用户的行为记录追踪
export const BehaviorStore = class {
  // 数组形式的 stack
  private state: Array<behaviorStack>;
  // 记录的最大数量
  private maxBehaviorRecords: number;
  // 外部传入 options 初始化，
  constructor(options: behaviorRecordsOptions) {
    const { maxBehaviorRecords } = options;
    this.maxBehaviorRecords = maxBehaviorRecords;
    this.state = [];
  }
  // 从底部插入一个元素，且不超过 maxBehaviorRecords 限制数量
  push(value: behaviorStack) {
    if (this.length() === this.maxBehaviorRecords) {
      this.shift();
    }
    this.state.push(value);
  }
  // 从顶部删除一个元素，返回删除的元素
  shift() {
    return this.state.shift();
  }
  // 获取用户暂存栈长度
  length() {
    return this.state.length;
  }
  // 获取用户记录栈
  get() {
    return this.state;
  }
  // 清空用户记录栈
  clear() {
    this.state = [];
  }
};
