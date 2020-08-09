module.exports = {
  // ========
  // 実行環境
  // ========

  env: {
    // ブラウザ実行コードの検証（DOM API等）
    browser: true,

    // Node.jsコードの検証（require等）
    node: true,

    // ES6構文の検証
    es6: true
  },

  // ==================
  // 定義済ルールセット
  // ==================

  extends: [
    // Vue.js
    'plugin:vue/essential',

    // JavaScript標準ルール
    'standard'
  ],

  // ==============
  // グローバル関数
  // ==============

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',

    // jQuery
    $: 'readonly'
  },

  // ========
  // パーサー
  // ========

  parserOptions: {
    ecmaVersion: 2018,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },

  // ==========
  // プラグイン
  // ==========

  plugins: [
    'vue',
    '@typescript-eslint'
  ],

  // ======================
  // プロジェクトルール定義
  // ======================

  rules: {
    // 未定義要素の参照
    'no-use-before-define': [
      'error',
      {
        variables: false,
        functions: false,
        classes: false
      }
    ]
  }
}
