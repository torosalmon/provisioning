/*!
 * =============================================================================
 * [Gulp]
 * @update:  2019-11-15
 * @author:  torosalmon
 * @twitter: https://twitter.com/trs_torosalmon
 * =============================================================================
 */

// =============================================================================
// 設定
// =============================================================================

const setting = {
  dir: {
    // ルートディレクトリ
    root: '/',
    // ソースファイルディレクトリ
    src: 'src',
    // プロダクションファイルディレクトリ
    dist: 'dist'
  }
}

// =============================================================================
// npm
// =============================================================================

// Gulp
const gulp = require('gulp')
// webpack
const webpack = require('webpack')
// Gulpからwebpackを呼び出す
const webpackStream = require('webpack-stream')

// ==========
// ストリーム
// ==========

// シェルコマンド実行
const childProcess = require('child_process').exec
// ファイル削除
const del = require('del')
// エラー発生時にプロセスを停止しない
const plumber = require('gulp-plumber')
// gulp.task内でのif else文サポート
const gulpIfElse = require('gulp-if-else')
// ビニールファイルに任意のチャンク名を付加
const vinylNamed = require('vinyl-named')

// ============
// ビルド: 全般
// ============

// 差分ビルド
const changed = require('gulp-changed')
// SourceMaps
const sourcemaps = require('gulp-sourcemaps')

// ============
// ビルド: HTML
// ============

// HTML minify
const htmlmin = require('gulp-htmlmin')

// ===========
// ビルド: Pug
// ===========

// Pug
const pug = require('gulp-pug')

// ===========
// ビルド: CSS
// ===========

// PostCSS
const postcss = require('gulp-postcss')
// PostCSSプラグイン - ベンダープレフィクス付与
const autoprefixer = require('autoprefixer')
// CSS minify
const cssnano = require('gulp-cssnano')

// ============
// ビルド: SCSS
// ============

// SASS
const sass = require('gulp-sass')
// node_modules/からの@importをサポート
const sassPackageImporter = require('node-sass-package-importer')

// ============
// ビルド: JSON
// ============

// JSON minify
const jsonminify = require('gulp-jsonminify')

// ===========
// ビルド: IMG
// ===========

// 画像圧縮
const imagemin = require('gulp-imagemin')
const imageminPngquant = require('imagemin-pngquant')

// ==============
// ユーティリティ
// ==============

// ローカルサーバー
const webserver = require('gulp-webserver')

// =============================================================================
// 設定
// =============================================================================

// 対象ファイル
const file = {

  // 全てのタスクから除外するファイル
  ignore: [
    `!${setting.dir.src}/**/node_modules/*`,
    `!${setting.dir.src}/**/.git/*`,
    `!${setting.dir.src}/**/.svn/*`,
    `!${setting.dir.src}/**/Desktop.ini`,
    `!${setting.dir.src}/**/Thumbs.db`,
    `!${setting.dir.src}/**/.DS_Store`,
    `!${setting.dir.src}/**/_notes/*`,
    `!${setting.dir.src}/**/dwsync.xml`,
    `!${setting.dir.src}/**/*.src*`
  ],

  // HTML
  HTML: [
    `${setting.dir.src}/**/*.html`
  ],

  // Pug
  Pug: [
    `${setting.dir.src}/**/!(_)*.pug`
  ],

  // CSS
  CSS: [
    `${setting.dir.src}/**/!(_)*.css`,
    // [.min]を付けた[.css]を除外
    `!${setting.dir.src}/**/*.min.css`,
    // [venders/]ディレクトリを除外
    `!${setting.dir.src}/**/venders/*.css`,
    // WordPressテーマファイルを除外
    `!${setting.dir.src}/**/wp-content/themes/*/style.css`
  ],

  // SCSS
  SCSS: [
    `${setting.dir.src}/**/!(_)*.scss`
  ],

  // JavaScript, TypeScript
  SCRIPT: [
    `${setting.dir.src}/**/!(_)*.js`,
    `${setting.dir.src}/**/!(_)*.ts`,
    // [.min]を付けた[.js]を除外
    `!${setting.dir.src}/**/*.min.js`,
    // [venders/]ディレクトリを除外
    `!${setting.dir.src}/**/venders/*.js`
  ],

  // JSON
  JSON: [
    `${setting.dir.src}/**/*.json`
  ],

  // IMG
  IMG: [
    `${setting.dir.src}/**/*.gif`,
    `${setting.dir.src}/**/*.jpg`,
    `${setting.dir.src}/**/*.jpeg`,
    `${setting.dir.src}/**/*.png`,
    `${setting.dir.src}/**/*.svg`
  ],

  // コピーするファイル
  copy: [
    // ビルド対象ファイル以外の全てのファイル
    `${setting.dir.src}/**/*.!(html|pug|css|scss|js|ts|json|svg|gif|jpg|jpeg|png)`,
    // [.min]を付けた[.css, .js]
    `${setting.dir.src}/**/*.min.(css|js)`,
    // [venders/]ディレクトリ
    `${setting.dir.src}/**/venders/*.(css|js)`,
    // WordPressテーマファイル
    `${setting.dir.src}/**/wp-content/themes/*/style.css`
  ]

}

// 配列結合
Array.prototype.push.apply(file.HTML, file.ignore)
Array.prototype.push.apply(file.Pug, file.ignore)
Array.prototype.push.apply(file.CSS, file.ignore)
Array.prototype.push.apply(file.SCSS, file.ignore)
Array.prototype.push.apply(file.SCRIPT, file.ignore)
Array.prototype.push.apply(file.JSON, file.ignore)
Array.prototype.push.apply(file.IMG, file.ignore)
Array.prototype.push.apply(file.copy, file.ignore)

// =============================================================================
// 動作モード
// production: プロダクションモード
// development: 開発モード
// npm script(process.argv.slice(2))からの引数で判定
// =============================================================================

let mode
if (process.argv.slice(2) === '--development') {
  mode = 'development'
  console.log('[Gulp] 開発モード')
} else {
  mode = 'production'
  console.log('[Gulp] プロダクションモード')
}

// =============================================================================
// rm: プロダクションディレクトリのクリーンアップ
// =============================================================================

const rm = (callback) => {
  del([
    `${setting.dir.dist}/*`
  ], {
    dot: true
  })

  callback()
}

// =============================================================================
// mkdir: プロジェクトディレクトリの作成
// =============================================================================

const mkdir = (callback) => {
  childProcess(`mkdir ${setting.dir.src}`, (_err, _stdout, _stderr) => {})
  childProcess(`mkdir ${setting.dir.dist}`, (_err, _stdout, _stderr) => {})

  callback()
}

// =============================================================================
// build
// =============================================================================

// ===============
// ビルド: webpack
// ===============

const buildWebpack = (callback) => {
  gulp.src(file.SCRIPT, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // vinyl-named
    .pipe(
      vinylNamed(
        (file) => {
          return file.relative.replace(/\.[^\.]+$/, '')
        }
      )
    )

    // webpack-stream
    .pipe(
      webpackStream({

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
                        '@babel/preset-env', {
                          modules: false,
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
                        '@babel/preset-env', {
                          modules: false,
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
      }, webpack)
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ============
// ビルド: HTML
// ============

const buildHTML = (callback) => {
  gulp.src(file.HTML, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error HTML] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // minify
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return htmlmin({
          // スペースを除去
            collapseWhitespace: true,
            // コメントを除去する
            removeComments: true
          })
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ===========
// ビルド: Pug
// ===========

const buildPug = (callback) => {
  gulp.src(file.Pug, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error Pug] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // コンパイル
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return pug()
        },
        // 開発モード：minifyしない
        () => {
          return pug({
            pretty: true
          })
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ===========
// ビルド: CSS
// ===========

const buildCSS = (callback) => {
  gulp.src(file.CSS, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error CSS] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // SourceMaps (init)
    .pipe(
      gulpIfElse(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.init()
        }
      )
    )

    // ベンダープレフィクス付与
    .pipe(
      postcss([
        autoprefixer({
          // CSS gridのサポート
          grid: true
        })
      ])
    )

    // minify
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return cssnano()
        }
      )
    )

    // SourceMaps (write)
    .pipe(
      gulpIfElse(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.write('./')
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ============
// ビルド: SCSS
// ============

const buildSCSS = (callback) => {
  gulp.src(file.SCSS, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error SCSS] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // SourceMaps (init)
    .pipe(
      gulpIfElse(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.init()
        }
      )
    )

    // コンパイル
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return sass({
            outputStyle: 'compressed',
            // node_modules/からの@importをサポート
            importer: sassPackageImporter({
              extensions: ['.css', '.scss']
            })
          })
        },
        // 開発モード：minifyしない
        () => {
          return sass({
            outputStyle: 'expanded',
            // node_modules/からの@importをサポート
            importer: sassPackageImporter({
              extensions: ['.css', '.scss']
            })
          })
        }
      )
    )

    // ベンダープレフィクス付与
    .pipe(
      postcss([
        autoprefixer({
          // CSS gridのサポート
          grid: true
        })
      ])
    )

    // SourceMaps (write)
    .pipe(
      gulpIfElse(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.write('./')
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ============
// ビルド: JSON
// ============

const buildJSON = (callback) => {
  gulp.src(file.JSON, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error JSON] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // minify
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return jsonminify()
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ===========
// ビルド: IMG
// ===========

const buildIMG = (callback) => {
  gulp.src(file.IMG, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error IMG] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    // 画像圧縮
    .pipe(
      gulpIfElse(mode === 'production',
        // プロダクションモード：画像圧縮する
        () => {
          return imagemin([
            imagemin.svgo(),
            imagemin.gifsicle(),
            imagemin.jpegtran({
              quality: 50,
              progressive: true
            }),
            // imagemin.optipng(),
            imageminPngquant()
          ])
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// ====================================
// copy: ビルド対象以外のファイルコピー
// ====================================

const copy = (callback) => {
  gulp.src(file.copy, {
    base: `${setting.dir.src}/`,
    dot: true
  })

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => {
          console.log(`[error copy] ${err}`)
        }
      })
    )

    // 差分ビルド
    .pipe(
      changed(setting.dir.dist)
    )

    .pipe(
      gulp.dest(setting.dir.dist)
    )

  callback()
}

// =============================================================================
// server: 開発モード時にローカルサーバーを起動
// =============================================================================

const server = (callback) => {
  gulp.src(setting.dir.dist)

    .pipe(
      webserver({
        livereload: true,
        host: 'localhost',
        port: 8000,
        open: `http://localhost:8000${setting.dir.root}`
      })
    )

  callback()
}

// =============================================================================
// idle
// =============================================================================

const idle = (callback) => {
  console.log('[Gulp] 起動処理終了。以降ファイル更新時にタスクを実行します。[Ctrl+C]でGulpを停止')

  callback()
}

// =============================================================================
// メインスレッド
// gulp.series: 直列処理
// gulp.parallel: 並列処理
// =============================================================================

// watch
const watch = (callback) => {
  gulp.watch(file.SCRIPT, gulp.parallel(buildWebpack))
  gulp.watch(file.HTML, gulp.parallel(buildHTML))
  gulp.watch(file.Pug, gulp.parallel(buildPug))
  gulp.watch(file.CSS, gulp.parallel(buildCSS))
  gulp.watch(file.SCSS, gulp.parallel(buildSCSS))
  gulp.watch(file.JSON, gulp.parallel(buildJSON))
  gulp.watch(file.IMG, gulp.parallel(buildIMG))
  gulp.watch(file.copy, gulp.parallel(copy))

  callback()
}

// default
gulp.task('default',
  gulp.series(
    // rm,
    mkdir,
    gulp.parallel(
      buildWebpack,
      buildHTML,
      buildPug,
      buildCSS,
      buildSCSS,
      buildJSON,
      buildIMG,
      copy
    ),
    watch,
    server,
    idle
  )
)
