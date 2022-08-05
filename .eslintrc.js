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
    'no-console': isDev ? 'off' : 'error', // 开发环境允许console，代码提交不允许
    quotes: ['error', 'single'], // 如果不是单引号，则报错
  },
};
