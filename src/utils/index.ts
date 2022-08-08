/*
 * @Author: yuzy
 * @Date: 2022-08-05 14:28:55
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-08 15:33:15
 * @Description:
 */
export const getStackLines = (stack: string) => {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
};

export const serilizeUrl = (url: string) => {
  const result: Record<string, string> = {};
  if (url.split('?').length > 1) {
    url = url.split('?')[1];
    const params = url.split('&');
    params.forEach((item) => {
      result[item.split('=')[0]] = item.split('=')[1];
    });
  }
  return result;
};
