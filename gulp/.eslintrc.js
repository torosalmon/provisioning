module.exports = {

  // 制作環境の定義
  env: {
    browser: true, // ブラウザ実行コードの検証（DOM API等）
    node: true, // Node.jsコードの検証（require等）
    es6: true // ES6構文の検証
  },

  // 検証オプション
  parserOptions: {
    parser: 'babel-eslint', // Babel
    sourceType: 'module', // [env.es6]に[ES Modules]の検証を追加
    ecmaVersion: 2018 // [env.es6]バージョン詳細指定
  },

  // パーサー
  parser: '@typescript-eslint/parser',

  // プラグイン
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],

  // ルールセット
  extends: [
    // TypeScript
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',

    'standard', // JavaScript Standard Style: https://standardjs.com/
    'prettier'
  ],

  // プロジェクトルール定義
  rules: {
    'prettier/prettier': [
      'error',
      {
        'singleQuote': true,
        'semi': false,
        'printWidth': false
      }
    ]
  },

  // グローバル変数定義
  globals: {
    '$': 'readonly', // jQuery
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly' // WebGL
  }

}
