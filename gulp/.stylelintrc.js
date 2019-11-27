module.exports = {
  configBasedir: './',

  // プラグイン
  plugins: [
    'stylelint-scss',
    'stylelint-declaration-block-no-ignored-properties'
  ],

  // ルールセット
  extends: [
    './node_modules/prettier-stylelint/config.js',
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-config-recess-order'
  ],

  // プロジェクトルール定義
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'no-duplicate-selectors': null,
    'no-descending-specificity': null
  }

}
