/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:28:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-05 17:32:53
 * @Description:
 */
export const getStackLines = (stack: string) => {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
};
