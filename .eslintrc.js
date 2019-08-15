module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-undefined': 'off',
    'strict-null-checks': 'off',
    'no-throw-literal': 'off',
    'no-fallthrough': 'off'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
