module.exports = {

  // ==================
  // 定義済ルールセット
  // ==================

  extends: [
    // SCSS標準ルール
    'stylelint-config-recommended-scss',

    // CSS標準ルール
    'stylelint-config-standard',

    // プロパティ記述順序ルール
    'stylelint-config-recess-order'
  ],

  // ==========
  // プラグイン
  // ==========

  plugins: [
    // display値によって無効化されてしまうプロパティの検出
    'stylelint-declaration-block-no-ignored-properties'
  ],

  // ======================
  // プロジェクトルール定義
  // ======================

  rules: {
    // @から始まる記述への警告
    'at-rule-no-unknown': null,

    // @から始まる記述への警告（SCSS）
    "scss/at-rule-no-unknown": [
      true, {
        // @use, @forward構文の使用を許可
        ignoreAtRules: ['use', 'forward']
      }
    ],

    // 重複したセレクタの検出
    'no-duplicate-selectors': null,

    // display値によって無効化されてしまうプロパティの検出
    'plugin/declaration-block-no-ignored-properties': true
  }
}
