/*
 * @Author: yuzy
 * @Date: 2022-08-05 18:23:57
 * @LastEditors: yuzy
 * @LastEditTime: 2022-08-30 14:53:10
 * @Description:
 */
const isDev = process.env.NODE_ENV === 'development';
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-debugger': isDev ? 'off' : 'error',
    'no-console': 'off', // 开发环境允许console，代码提交不允许
    quotes: ['error', 'single'], // 如果不是单引号，则报错
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'prefer-rest-params': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
};
