/*!
 * =============================================================================
 * [Gulp]
 * @update:  2019-04-09
 * @author:  torosalmon
 * @twitter: https://twitter.com/trs_torosalmon
 * =============================================================================
!*/

// =============================================================================
// npm
// =============================================================================

// ====
// Gulp
// ====

const gulp = require('gulp')

// ==========
// ストリーム
// ==========

// シェルコマンド実行
const child_process = require('child_process').exec
// ファイル削除
const del = require('del')
// globパターンマッチ
const glob = require('glob')
// エラー発生時にプロセスを停止しない
const plumber = require('gulp-plumber')
// gulp.task内でのif else文サポート
const gulp_if_else = require('gulp-if-else')
// GulpとBrowserify間のファイル情報の受け渡し
const vinyl_source_stream = require('vinyl-source-stream')
const vinyl_buffer = require('vinyl-buffer')

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

// ==================
// ビルド: JavaScript
// ==================

// Browserify
const browserify = require('browserify')
// Babel
const babel = require('gulp-babel')
// JS minify
const uglify = require('gulp-uglify')

// ==================
// ビルド: TypeScript
// ==================

// Browserifyプラグイン - TypeScript
const tsify = require('tsify')

// ============
// ビルド: JSON
// ============

// JSON minify
const jsonminify = require('gulp-jsonminify')

// ===========
// ビルド: img
// ===========

// 画像圧縮
const imagemin = require('gulp-imagemin')
const imagemin_pngquant = require('imagemin-pngquant')

// ==============
// ユーティリティ
// ==============

// ローカルサーバー
const webserver = require('gulp-webserver')

// =============================================================================
// 設定
// =============================================================================

const setting = {
  dir: {
    // サーバー上でのルートディレクトリ
    root: '/',
    // ソースファイルディレクトリ
    src: 'src',
    // プロダクションファイルディレクトリ
    dist: 'dist'
  }
}

// 対象ファイル
const file = {

  // 全てのタスクから除外するファイル
  ignore: [
    '!' + setting.dir.src + '/**/node_modules/*',
    '!' + setting.dir.src + '/**/.git/*',
    '!' + setting.dir.src + '/**/.svn/*',
    '!' + setting.dir.src + '/**/Desktop.ini',
    '!' + setting.dir.src + '/**/Thumbs.db',
    '!' + setting.dir.src + '/**/.DS_Store',
    '!' + setting.dir.src + '/**/_notes/*',
    '!' + setting.dir.src + '/**/dwsync.xml',
    '!' + setting.dir.src + '/**/*.src*'
  ],

  // HTML
  HTML: [
    setting.dir.src + '/**/*.html'
  ],

  // Pug
  Pug: [
    setting.dir.src + '/**/!(_)*.pug'
  ],

  // CSS
  CSS: [
    setting.dir.src + '/**/!(_)*.css',
    // [.min]を付けた[.css]を除外
    '!' + setting.dir.src + '/**/*.min.css',
    // WordPressテーマファイルを除外
    '!' + setting.dir.src + '/**/wp-content/themes/*/style.css'
  ],

  // SCSS
  SCSS: [
    setting.dir.src + '/**/!(_)*.scss'
  ],

  // JavaScript
  JavaScript: [
    setting.dir.src + '/**/!(_)*.js',
    // [.min]を付けた[.js]を除外
    '!' + setting.dir.src + '/**/*.min.js'
  ],

  // TypeScript
  TypeScript: [
    setting.dir.src + '/**/!(_)*.ts'
  ],

  // JSON
  JSON: [
    setting.dir.src + '/**/*.json'
  ],

  // img
  img: [
    setting.dir.src + '/**/*.gif',
    setting.dir.src + '/**/*.jpg',
    setting.dir.src + '/**/*.jpeg',
    setting.dir.src + '/**/*.png',
    setting.dir.src + '/**/*.svg'
  ],

  // コピーするファイル
  copy: [
    // ビルド対象ファイル以外の全てのファイル
    setting.dir.src + '/**/*.!(html|pug|css|scss|js|ts|json|svg|gif|jpg|jpeg|png)',
    // [.min]を付けた[.css, .js]
    setting.dir.src + '/**/*.min.(css|js)',
    // WordPressテーマファイル
    setting.dir.src + '/**/wp-content/themes/*/style.css'
  ]

}

// 配列結合
Array.prototype.push.apply(file.HTML, file.ignore)
Array.prototype.push.apply(file.Pug, file.ignore)
Array.prototype.push.apply(file.CSS, file.ignore)
Array.prototype.push.apply(file.SCSS, file.ignore)
Array.prototype.push.apply(file.JavaScript, file.ignore)
Array.prototype.push.apply(file.TypeScript, file.ignore)
Array.prototype.push.apply(file.JSON, file.ignore)
Array.prototype.push.apply(file.img, file.ignore)
Array.prototype.push.apply(file.copy, file.ignore)

// =============================================================================
// 動作モード
// production: プロダクションモード
// development: 開発モード
// npm scriptからの引数で判定
// =============================================================================

let mode
const npm_script_arg = process.argv.slice(2)

if (npm_script_arg[0] === '--development') {
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
    setting.dir.dist + '/*'
  ], {
    dot: true
  })

  callback()
}

// =============================================================================
// mkdir: プロジェクトディレクトリの作成
// =============================================================================

const mkdir = (callback) => {

  child_process('mkdir ' + setting.dir.src, (err, stdout, stderr) => {} )
  child_process('mkdir ' + setting.dir.dist, (err, stdout, stderr) => {} )

  callback()
}

// =============================================================================
// build
// =============================================================================

// ============
// ビルド: HTML
// ============

const build_HTML = (callback) => {
  gulp.src(file.HTML, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error HTML] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // minify
  .pipe(
    gulp_if_else(mode === 'production',
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

const build_Pug  = (callback) => {
  gulp.src(file.Pug, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error Pug] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // コンパイル
  .pipe(
    gulp_if_else(mode === 'production',
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

const build_CSS  = (callback) => {
  gulp.src(file.CSS, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error CSS] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if_else(mode === 'development',
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
        grid: true // CSS gridのサポート
      })
    ])
  )

  // minify
  .pipe(
    gulp_if_else(mode === 'production',
      // プロダクションモード：minifyする
      () => {
        return cssnano()
      }
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if_else(mode === 'development',
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

const build_SCSS = (callback) => {
  gulp.src(file.SCSS, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error SCSS] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if_else(mode === 'development',
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
        grid: true // CSS gridのサポート
      })
    ])
  )

  // コンパイル
  .pipe(
    gulp_if_else(mode === 'production',
      // プロダクションモード：minifyする
      () => {
        return sass({
          outputStyle: 'compressed'
        })
      },
      // 開発モード：minifyしない
      () => {
        return sass({
          outputStyle: 'expanded'
        })
      }
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if_else(mode === 'development',
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

// ==================
// ビルド: JavaScript
// ==================

// Browserifyでバンドル処理

// gulp & browserify で 汎用的に 複数のエントリーポイントを管理する
// https://qiita.com/okamoai/items/033a865c997540c6dcf7

const build_JavaScript = (callback) => {

  // ビルド対象ファイルの抽出
  const match_file = glob.sync(file.JavaScript[0])

  // マッチしたファイルのループ
  match_file.forEach((file) => {

    // ファイル名を取得
    const file_name = file.replace(/.+\/(.+\.js)/, '$1')

    // ディレクトリパスを取得
    // [setting.dir.src + '/']を除去
    // ['/' + ファイル名]を除去
    // 末尾に['/']を付け直す
    const file_dir = file.replace(new RegExp(setting.dir.src + '/(.*)/.+\.js'), '$1') + '/'

    // Browserify
    browserify({
      entries: file
    })

    .bundle()

    // vinyl形式へ変換
    .pipe(
      vinyl_source_stream(file_name)
    )
    .pipe(
      vinyl_buffer()
    )

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => { console.log('[error JavaScript] ' + err) }
      })
    )

    // SourceMaps (init)
    .pipe(
      gulp_if_else(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.init()
        }
      )
    )

    // Babel
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )

    // minify
    .pipe(
      gulp_if_else(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return uglify()
        }
      )
    )

    // SourceMaps (write)
    .pipe(
      gulp_if_else(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.write('./')
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist + '/' + file_dir)
    )

  })

  callback()
}

// ==================
// ビルド: TypeScript
// ==================

// Browserifyでバンドル処理

// gulp & browserify で 汎用的に 複数のエントリーポイントを管理する
// https://qiita.com/okamoai/items/033a865c997540c6dcf7
// gulp + browserify + tsifyを利用してTypeScriptコンパイル環境を作る
// https://blog.shibayu36.org/entry/2016/01/07/120000

const build_TypeScript = (callback) => {

  // ビルド対象ファイルの抽出
  const match_file = glob.sync(file.TypeScript[0])

  // マッチしたファイルのループ
  match_file.forEach((file) => {

    // ファイル名を取得
    const file_name = file.replace(/.+\/(.+\.ts)/, '$1')

    // ディレクトリパスを取得
    // [setting.dir.src + '/']を除去
    // ['/' + ファイル名]を除去
    // 末尾に['/']を付け直す
    const file_dir = file.replace(new RegExp(setting.dir.src + '/(.*)/.+\.ts'), '$1') + '/'

    // Browserify
    browserify({
      entries: file
    })

    // TypeScript
    .plugin('tsify', {
      target: 'ES5',
      module: 'commonjs'
    })
    .bundle()

    // vinyl形式へ変換
    .pipe(
      vinyl_source_stream(file_name.replace('.ts', '.js'))
    )
    .pipe(
      vinyl_buffer()
    )

    // エラー発生時にプロセスを停止させない
    .pipe(
      plumber({
        errorHandler: (err) => { console.log('[error TypeScript] ' + err) }
      })
    )

    // SourceMaps (init)
    .pipe(
      gulp_if_else(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.init()
        }
      )
    )

    // Babel
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )

    // minify
    .pipe(
      gulp_if_else(mode === 'production',
        // プロダクションモード：minifyする
        () => {
          return uglify()
        }
      )
    )

    // SourceMaps (write)
    .pipe(
      gulp_if_else(mode === 'development',
        // 開発モード：SourceMapsを出力する
        () => {
          return sourcemaps.write('./')
        }
      )
    )

    .pipe(
      gulp.dest(setting.dir.dist + '/' + file_dir)
    )

  })

  callback()
}

// ============
// ビルド: JSON
// ============

const build_JSON = (callback) => {
  gulp.src(file.JSON, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error JSON] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // minify
  .pipe(
    gulp_if_else(mode === 'production',
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
// ビルド: img
// ===========

const build_img = (callback) => {
  gulp.src(file.img, {
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error img] ' + err) }
    })
  )

  // 差分ビルド
  .pipe(
    changed(setting.dir.dist)
  )

  // 画像圧縮
  .pipe(
    gulp_if_else(mode === 'production',
      // プロダクションモード：画像圧縮する
      () => {
        return imagemin([
          imagemin.svgo(),
          imagemin.gifsicle(),
          imagemin.jpegtran({
            quality: 60,
            progressive: true
          }),
          // imagemin.optipng(),
          imagemin_pngquant()
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
    base: setting.dir.src + '/',
    dot: true
  })

  // エラー発生時にプロセスを停止させない
  .pipe(
    plumber({
      errorHandler: (err) => { console.log('[error copy] ' + err) }
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
      open: 'http://localhost:8000' + setting.dir.root
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
  gulp.watch(file.HTML, gulp.parallel(build_HTML))
  gulp.watch(file.Pug, gulp.parallel(build_Pug))
  gulp.watch(file.CSS, gulp.parallel(build_CSS))
  gulp.watch(file.SCSS, gulp.parallel(build_SCSS))
  gulp.watch(file.JavaScript, gulp.parallel(build_JavaScript))
  gulp.watch(file.TypeScript, gulp.parallel(build_TypeScript))
  gulp.watch(file.JSON, gulp.parallel(build_JSON))
  gulp.watch(file.img, gulp.parallel(build_img))
  gulp.watch(file.copy, gulp.parallel(copy))

  callback()
}

// default
gulp.task('default',
  gulp.series(
    // rm,
    mkdir,
    gulp.parallel(
      build_HTML,
      build_Pug,
      build_CSS,
      build_SCSS,
      build_JavaScript,
      build_TypeScript,
      build_JSON,
      build_img,
      copy
    ),
    watch,
    server,
    idle
  )
)
