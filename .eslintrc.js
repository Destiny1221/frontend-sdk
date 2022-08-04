const isDev = process.env.NODE_ENV === 'development'
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
    'no-debugger': isDev ? 'error' : 'off',
    'no-console': 'error',
    'no-empty': 'error',// 不允许出现空白的代码块
    quotes: ['error', 'single'],// 如果不是单引号，则报错
  },
};
