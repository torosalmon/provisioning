/*
 * =============================================================================
 * [Gulp & webpack]
 * @update: 2020-06-05
 * @author: torosalmon
 * @twitter: https://twitter.com/trs_torosalmon
 * =============================================================================
 */

// =============================================================================
// 設定
// =============================================================================

// ========================
// プロジェクトディレクトリ
// ========================

// 出力ディレクトリ
const distDir = 'dist'
// ソースディレクトリ
const srcDir = 'src'
// プロジェクトルートディレクトリ
const projectRootDir = ''

// ==============
// ローカルサーバ
// ==============

// ローカルサーバを利用する
const localServerEnable = true
// ポート番号
const localServerPort = 3000
// ライブリロードを利用する
const localServerLiveReloadEnable = true
// 起動ブラウザ
const localServerBrowser = [
  'chrome'
  // `firefox`
]

// ==================
// ビルド対象ファイル
// ==================

// HTML
const fileHTML = [
  `${srcDir}/**/!(_)*.html`,
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// Pug
const filePug = [`${srcDir}/**/!(_)*.pug`]

// CSS
const fileCSS = [
  `${srcDir}/**/!(_)*.css`,
  `!${srcDir}/**/*.min.css`, // [*.min.css]を除外
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// Sass
const fileSass = [
  `${srcDir}/**/!(_)*.scss`,
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// JavaScript, TypeScript
const fileJavaScriptTypeScript = [
  `${srcDir}/**/!(_)*.js`,
  `${srcDir}/**/!(_)*.ts`,
  `!${srcDir}/**/*.min.js`, // [*.min.js]を除外
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// JSON
const fileJSON = [
  `${srcDir}/**/*.json`,
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// 画像
const fileImg = [
  `${srcDir}/**/*.svg`,
  `${srcDir}/**/*.png`,
  `${srcDir}/**/*.jpg`,
  `${srcDir}/**/*.jpeg`,
  `${srcDir}/**/*.gif`,
  `!${srcDir}/**/venders/**/*` // [/venders/]以下を除外
]

// ======================
// コピーのみ行うファイル
// ======================

const fileCopy = [
  `${srcDir}/**/*.!(html|pug|css|scss|js|ts|json|svg|png|jpg|jpeg|gif)`, // ビルド対象ファイル以外の全ファイル
  `${srcDir}/**/*.min.css`, // [*.min.css]
  `${srcDir}/**/*.min.js` // [*.min.js]
]

// =========================
// 全タスク共通 除外ファイル
// =========================

const fileIgnore = [
  `!${srcDir}/**/node_modules/*`,
  `!${srcDir}/**/.git/*`,
  `!${srcDir}/**/.svn/*`,
  `!${srcDir}/**/Desktop.ini`,
  `!${srcDir}/**/Thumbs.db`,
  `!${srcDir}/**/.DS_Store`,
  `!${srcDir}/**/_notes/*`,
  `!${srcDir}/**/dwsync.xml`,
  `!${srcDir}/**/@types/*`,
  `!${srcDir}/**/*.src*`,

  // [WordPress]配下を除外
  // [themes]の[twenty-xx]以外のテーマは除外ファイルに含まず、Gulpで処理される
  `!${srcDir}/**/wp/*`,
  `!${srcDir}/**/wordpress/*`,
  `!${srcDir}/**/wp-admin/**/*`,
  `!${srcDir}/**/wp-content/languages/**/*`,
  `!${srcDir}/**/wp-content/plugins/**/*`,
  `!${srcDir}/**/wp-content/*`,
  `!${srcDir}/**/wp-content/themes/*`,
  `!${srcDir}/**/wp-content/themes/twenty*/**/*`,
  `!${srcDir}/**/wp-content/upgrade/**/*`,
  `!${srcDir}/**/wp-content/uploads/**/*`,
  `!${srcDir}/**/wp-includes/**/*`
]

// 除外ファイルと配列を結合
Array.prototype.push.apply(fileHTML, fileIgnore)
Array.prototype.push.apply(filePug, fileIgnore)
Array.prototype.push.apply(fileCSS, fileIgnore)
Array.prototype.push.apply(fileSass, fileIgnore)
Array.prototype.push.apply(fileJavaScriptTypeScript, fileIgnore)
Array.prototype.push.apply(fileJSON, fileIgnore)
Array.prototype.push.apply(fileImg, fileIgnore)
Array.prototype.push.apply(fileCopy, fileIgnore)

// =============================================================================
// npm package
// =============================================================================

// ==========
// タスク全般
// ==========

// Gulp
//  * src: ファイル受付
//  * dest: ファイル出力
//  * series: タスクの同期実行
//  * parallel: タスクの非同期実行
//  * watch: ファイル監視
//  * lastRun: 差分ビルド
const { src, dest, series, parallel, watch, lastRun } = require('gulp')
// ファイル削除
const del = require('del')
// タスクエラー発生時に常駐を停止させない
const plumber = require('gulp-plumber')
// Gulpタスク内if文サポート
const gulpIf = require('gulp-if')
// ローカルサーバー
const browserSync = require('browser-sync').create()

// ===========
// webpack連携
// ===========

// webpack
const webpack = require('webpack')
// Gulpからwebpackを呼び出す
const webpackStream = require('webpack-stream')
// ビニールファイルに任意のチャンク名を付加
const vinylNamed = require('vinyl-named')

// ====
// HTML
// ====

// HTML minify
const htmlmin = require('gulp-htmlmin')
// Pug
const pug = require('gulp-pug')

// ===
// CSS
// ===

// Sass
const sass = require('gulp-sass')
// Sass コンパイラをdart-sassに指定
sass.compiler = require('sass')
// Sass - node_modulesからの@importをサポート
const sassPackageImporter = require('node-sass-package-importer')
// PostCSS
const postcss = require('gulp-postcss')
// PostCSS - ベンダープレフィクス付与
const autoprefixer = require('autoprefixer')
// CSS minify
const cssnano = require('gulp-cssnano')

// ====
// JSON
// ====

// JSON minify
const jsonminify = require('gulp-jsonminify')

// ====
// 画像
// ====

// 画像圧縮
const imagemin = require('gulp-imagemin')

// =============================================================================
// ビルドモード判定
// =============================================================================

let mode
if (process.argv.slice(2)[1] === 'production') {
  mode = 'production'
} else {
  mode = 'development'
}

// =============================================================================
// 出力ディレクトリのクリーンアップ
// =============================================================================

const clean = () => {
  return del([`${distDir}/*`])
}

// =============================================================================
// ビルド HTML
// =============================================================================

const buildHTML = cb => {
  src(fileHTML, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildHTML)
  })
    .pipe(plumber())

    // minify
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        htmlmin({
          collapseWhitespace: true, // スペース除去
          removeComments: true // コメント除去
        })
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド Pug
// =============================================================================

const buildPug = cb => {
  src(filePug, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildPug)
  })
    .pipe(plumber())

    // Pug
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        pug(),

        // 開発ビルド
        pug({
          pretty: true // minifyを行わない
        })
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド CSS
// =============================================================================

const buildCSS = cb => {
  src(fileCSS, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildCSS)
  })
    .pipe(plumber())

    // ベンダープレフィクス付与
    .pipe(
      postcss([
        autoprefixer({
          grid: true // display: grid;のIEサポート
        })
      ])
    )

    // minify
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        cssnano()
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド Sass
// =============================================================================

const buildSass = cb => {
  src(fileSass, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildSass)
  })
    .pipe(plumber())

    // Sass
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        sass({
          outputStyle: 'compressed',
          importer: sassPackageImporter({
            extensions: ['.css', '.scss']
          })
        }),

        // 開発ビルド
        sass({
          outputStyle: 'expanded',
          importer: sassPackageImporter({
            extensions: ['.css', '.scss']
          })
        })
      )
    )

    // ベンダープレフィクス付与
    .pipe(
      postcss([
        autoprefixer({
          grid: true // display: grid;のIEサポート
        })
      ])
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド JavaScript, TypeScript (webpack)
// =============================================================================

const buildWebpack = cb => {
  src(fileJavaScriptTypeScript, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildWebpack)
  })
    .pipe(plumber())

    // vinyl-named
    .pipe(
      vinylNamed(file => {
        return file.relative.replace(/\.[^.]+$/, '')
      })
    )

    // webpack-stream
    .pipe(
      webpackStream(
        {
          // =================
          // webpack.config.js
          // =================

          mode: mode,
          devtool: mode === 'development' ? 'source-map' : '',
          module: {
            rules: [
              // JavaScript
              {
                test: /\.js$/,
                exclude: /node_modules/,
                // ※下から順に処理する
                use: [
                  // Babel
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        [
                          '@babel/preset-env',
                          {
                            modules: false,
                            corejs: 3,
                            useBuiltIns: 'usage'
                          }
                        ]
                      ]
                    }
                  }
                ]
              },

              // TypeScript
              {
                test: /\.ts$/,
                exclude: /node_modules/,
                // ※下から順に処理する
                use: [
                  // Babel
                  {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        [
                          '@babel/preset-env',
                          {
                            modules: false,
                            corejs: 3,
                            useBuiltIns: 'usage'
                          }
                        ]
                      ]
                    }
                  },

                  // TypeScript
                  {
                    loader: 'ts-loader'
                  }
                ]
              }
            ]
          },
          resolve: {
            // import文で省略する拡張子を登録
            extensions: ['.js', '.ts'],
            // Vue.js (https://vuejs.org/v2/guide/installation.html#Webpack)
            alias: {
              vue$: 'vue/dist/vue.esm.js'
            }
          }
        },
        webpack
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド JSON
// =============================================================================

const buildJSON = cb => {
  src(fileJSON, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildJSON)
  })
    .pipe(plumber())

    // minify
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        jsonminify()
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド 画像
// =============================================================================

const buildImg = cb => {
  src(fileImg, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(buildImg)
  })
    .pipe(plumber())

    // 画像圧縮
    .pipe(
      gulpIf(
        mode === 'production',

        // プロダクションビルド
        imagemin([
          imagemin.svgo(),
          imagemin.optipng(),
          imagemin.mozjpeg({
            quality: 50,
            progressive: true
          }),
          imagemin.gifsicle()
        ])
      )
    )

    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ビルド対象外のファイルをコピー
// =============================================================================

const copy = cb => {
  src(fileCopy, {
    base: `${srcDir}/`,
    dot: true,
    since: lastRun(copy)
  })
    .pipe(plumber())
    .pipe(dest(distDir))

  cb()
}

// =============================================================================
// ローカルサーバ
// =============================================================================

const localServer = cb => {
  if (localServerEnable) {
    browserSync.init({
      browser: localServerBrowser,
      server: {
        baseDir: distDir
      },
      port: localServerPort,
      startPath: `/${projectRootDir}`,
      watch: localServerLiveReloadEnable,
      ghostMode: {
        clicks: true,
        forms: true,
        location: true,
        scroll: true
      }
    })
  }

  cb()
}

// =============================================================================
// start
// =============================================================================

// watch タスク登録
const watchRegist = cb => {
  watch(fileHTML, buildHTML)
  watch(filePug, buildPug)
  watch(fileCSS, buildCSS)
  watch(fileSass, buildSass)
  watch(fileJavaScriptTypeScript, buildWebpack)
  watch(fileJSON, buildJSON)
  watch(fileImg, buildImg)
  watch(fileCopy, copy)

  cb()
}

// $ npx gulp
exports.default = series(
  clean,
  parallel(
    buildHTML,
    buildPug,
    buildCSS,
    buildSass,
    buildWebpack,
    buildJSON,
    buildImg,
    copy
  ),
  watchRegist,
  localServer,
  function GulpStarting () {
    console.log(' ---------------------------------------')
    console.log(
      '[' + '\u001b[34m' + 'Gulp' + '\u001b[0m' + '] 起動処理を完了しました。以後はファイル更新監視タスクが常駐します。終了するには【Ctrl + C】を入力してください。'
    )
    console.log(' ---------------------------------------')
    if (mode === 'production') {
      console.log('[' + '\u001b[34m' + 'Gulp' + '\u001b[0m' + '] プロダクションビルド')
    } else {
      console.log('[' + '\u001b[34m' + 'Gulp' + '\u001b[0m' + '] 開発ビルド')
    }
    console.log(' ---------------------------------------')
  }
)
