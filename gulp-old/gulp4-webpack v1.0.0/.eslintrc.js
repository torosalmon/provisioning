module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: 'standard',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    parser: 'babel-eslint'
  },
  plugins: [
    '@typescript-eslint',
    'vue'
  ],
  rules: {
    'no-multiple-empty-lines': 1,
    'padded-blocks': 'off'
  }
}
