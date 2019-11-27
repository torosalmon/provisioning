module.exports = {
  extends: [
    './node_modules/prettier-stylelint/config.js',
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-config-recess-order'
  ],
  plugins: [
    'stylelint-scss',
    'stylelint-declaration-block-no-ignored-properties'
  ],
  ignoreFiles: [
    '**/node_modules/**',
    '**/venders/**'
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'no-duplicate-selectors': null,
    'no-descending-specificity': null
  },
}
