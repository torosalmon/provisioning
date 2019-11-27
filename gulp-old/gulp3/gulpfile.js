/*!
 * =============================================================================
 * [Gulp]
 * @update:  2018-03-13
 * @author:  torosalmon
 * @twitter: https://twitter.com/trs_torosalmon
 * =============================================================================
!*/

// =============================================================================
// [コマンド]
// $npm start
// $npm run gulp
// $npm run dev   … 開発モードで起動
//                   〇 SourceMaps
//                   Ｘ minify
// $npm run build … デプロイモードで起動
//                   Ｘ SourceMaps
//                   〇 minify
//
// [ディレクトリ構成]
// ・/root
// ├ /$dir_dist
// ├ /$dir_src
// ├ package.json
// └ gulpfile.js
//
// [ビルド]
// .html                … minify
// .pug                 … Pug, minify
// .css, .pcss          … PostCSS, minify, auto prefixer, SourceMaps
// .scss                … SASS, minify, auto prefixer, SourceMaps
// .js                  … Babel, minify, SourceMaps
// .ts                  … TypeScript, Babel, minify, SourceMaps
// .json                … minify
// .svg, .gif, jpg, png … optimize
//
// [特殊な処理]
// ・ファイル名に「.src」が含まれる
//   →ビルドせず、distにも送らない。
// ・接頭に「_」が付いた「pug, css, scss, pcss, js, ts」
//   →ビルドせず、distにも送らない。他のファイルからimportを前提としたファイル。
// ・接尾に「.min」が付いた「css, js」
//   →ビルドせず、distへコピーする。ライブラリ向け設定。
// ・接尾に「.raw」が付いた「js」
//   →minify処理し、distへ送る。Babelが通らないライブラリ向け設定。
// =============================================================================

// =============================================================================
// 設定
// =============================================================================

const dir_src  = 'src';  // ソースファイルディレクトリ
const dir_dist = 'dist'; // 公開ファイルディレクトリ

const server_root = '/'; // ローカルサーバールートディレクトリ

const html_minify_flag = true; // HTMLをminify（falseだとnpm run buildでもminifyしない）
const json_minify_flag = true; // JSONをminify（falseだとnpm run buildでもminifyしない）

// =============================================================================
// npmパッケージのインクルード
// =============================================================================

// Core
const gulp          = require('gulp');               // Gulp
const child_process = require('child_process').exec; // コマンドライン実行
const minimist      = require('minimist');           // npm scriptから引数を受け取る
const del           = require('del');                // ファイル削除
const rename        = require('gulp-rename');        // ファイルリネーム

// Stream
const run_sequence = require('run-sequence'); // 同期処理
const gulp_if      = require('gulp-if');      // pipe内での条件分岐
const plumber      = require('gulp-plumber'); // エラー発生時にgulp watchを停止させない
const notify       = require('gulp-notify');  // バルーン通知
const changed      = require('gulp-changed'); // 更新されたファイルのみビルド

// Server
const webserver = require('gulp-webserver'); // ローカルサーバー

// Build
const sourcemaps = require('gulp-sourcemaps'); // SourceMaps

// HTML
const htmlhint = require('gulp-htmlhint'); // htmlhint
const htmlmin  = require('gulp-htmlmin');  // HTML minify
const pug      = require('gulp-pug');      // Pug

// CSS
const stylelint                 = require('gulp-stylelint');            // stylelint
const autoprefixer              = require('gulp-autoprefixer');         // ベンダープレフィクス付与
const postcss                   = require('gulp-postcss');              // PostCSS
const postcss_import            = require('postcss-import');            // PostCSS - @importファイル取り込み
const postcss_mixins            = require('postcss-mixins');            // PostCSS - @mixin
const postcss_extend            = require('postcss-extend');            // PostCSS - placeholder
const postcss_nested            = require('postcss-nested');            // PostCSS - ネスト構文
const postcss_custom_properties = require('postcss-custom-properties'); // PostCSS - 変数
const postcss_flexbugs_fixes    = require('postcss-flexbugs-fixes');    // PostCSS - flexboxバグ修正
const postcss_will_change       = require('postcss-will-change');       // PostCSS - will-change最適化
const postcss_calc              = require('postcss-calc');              // PostCSS - calc最適化
const postcss_csswring          = require('csswring');                  // PostCSS - minify
const sass                      = require('gulp-sass');                 // SASS

// JS
const eslint     = require('gulp-eslint');     // ESLint
const uglify     = require('gulp-uglify');     // JS minify
const babel      = require('gulp-babel');      // Babel
const typescript = require('gulp-typescript'); // TypeScript

// JSON
const jsonminify = require('gulp-jsonminify'); // JSON minify

// Img
const imagemin          = require('gulp-imagemin');     // optimize (svg, gif, jpg, png)
const imagemin_pngquant = require('imagemin-pngquant'); // imagemin - pngquant

// =============================================================================
// 動作モード
// =============================================================================

let run_dev;
let run_build;

// npm script 引数解析
const arg_npm = minimist(process.argv.slice(2));

// --dev 開発モード
if(arg_npm['dev'] === true) {
  run_dev   = true;
  run_build = false;

  console.log('# ==============================================================================');
  console.log('# [Gulp] run dev');
  console.log('# ==============================================================================');
}

// --build デプロイモード
else {
  run_dev   = false;
  run_build = true;

  console.log('# ==============================================================================');
  console.log('# [Gulp] run build');
  console.log('# ==============================================================================');
}

// =============================================================================
// 対象ファイル
// =============================================================================

// =================================
// $dir_distへファイルコピーのみ行う
// =================================

const file_copy = [
  dir_src + '/**/*.!(html|pug|css|pcss|scss|js|ts|json|svg|gif|jpg|jpeg|png)', // ビルド対象ファイル以外の全て
  dir_src + '/**/*.min.css',                                                   // ビルド済みCSS
  dir_src + '/**/*.min.js',                                                    // ビルド済みJS
  dir_src + '/**/wp-content/themes/*/style.css',                               // WordPressテーマファイル
  '!' + dir_src + '/**/*.raw.js'                                               // JSを除外
];

// ======
// ビルド
// ======

const file_build_html = [
  dir_src + '/**/*.html'
];
const file_build_pug = [
  dir_src + '/**/!(_)*.pug'
];
const file_build_postcss = [
  dir_src + '/**/!(_)*.css',
  dir_src + '/**/!(_)*.pcss',
  '!' + dir_src + '/**/*.min.css',
  '!' + dir_src + '/**/wp-content/themes/*/style.css'
];
const file_build_sass = [
  dir_src + '/**/!(_)*.scss'
];
const file_build_javascript = [
  dir_src + '/**/!(_)*.raw.js',
  '!' + dir_src + '/**/*.min.js'
];
const file_build_ecmascript = [
  dir_src + '/**/!(_)*.js',
  '!' + dir_src + '/**/!(_)*.raw.js',
  '!' + dir_src + '/**/*.min.js'
];
const file_build_typescript = [
  dir_src + '/**/!(_)*.ts'
];
const file_build_json = [
  dir_src + '/**/*.json'
];
const file_build_img = [
  dir_src + '/**/*.svg',
  dir_src + '/**/*.gif',
  dir_src + '/**/*.jpg',
  dir_src + '/**/*.jpeg',
  dir_src + '/**/*.png'
];

// ============================================================
// ソースファイル以外のプロジェクト内ファイル（一律で除外判定）
// ============================================================

const file_exclusion = [
  '!' + dir_src + '/**/node_modules/*',
  '!' + dir_src + '/**/.git/*',
  '!' + dir_src + '/**/.svn/*',
  '!' + dir_src + '/**/Desktop.ini',
  '!' + dir_src + '/**/Thumbs.db',
  '!' + dir_src + '/**/.DS_Store',
  '!' + dir_src + '/**/_notes/*',
  '!' + dir_src + '/**/dwsync.xml',
  '!' + dir_src + '/**/*.src*'
];

// 一律除外ファイルを結合
Array.prototype.push.apply(file_copy,             file_exclusion);
Array.prototype.push.apply(file_build_html,       file_exclusion);
Array.prototype.push.apply(file_build_pug,        file_exclusion);
Array.prototype.push.apply(file_build_postcss,    file_exclusion);
Array.prototype.push.apply(file_build_sass,       file_exclusion);
Array.prototype.push.apply(file_build_javascript, file_exclusion);
Array.prototype.push.apply(file_build_ecmascript, file_exclusion);
Array.prototype.push.apply(file_build_typescript, file_exclusion);
Array.prototype.push.apply(file_build_json,       file_exclusion);
Array.prototype.push.apply(file_build_img,        file_exclusion);

// =============================================================================
// メインスレッド
// =============================================================================

gulp.task('default', (callback) => {
  run_sequence(
    'clean',
    'mkdir:dist',
    [
      'copy',
      'build:HTML',
      'build:Pug',
      'build:PostCSS',
      'build:SASS',
      'build:JavaScript',
      'build:ECMAScript',
      'build:TypeScript',
      'build:JSON',
      'build:img',
    ],
    'watch',
    'server',
    'idling',
    callback
  );
});

// =====
// Watch
// =====

gulp.task('watch', () => {
  gulp.watch(file_copy,             ['copy']);
  gulp.watch(file_build_html,       ['build:HTML']);
  gulp.watch(file_build_pug,        ['build:Pug']);
  gulp.watch(file_build_postcss,    ['build:PostCSS']);
  gulp.watch(file_build_sass,       ['build:SASS']);
  gulp.watch(file_build_javascript, ['build:JavaScript']);
  gulp.watch(file_build_ecmascript, ['build:ECMAScript']);
  gulp.watch(file_build_typescript, ['build:TypeScript']);
  gulp.watch(file_build_json,       ['build:JSON']);
  gulp.watch(file_build_img,        ['build:img']);
});

// =============================================================================
// セットアップタスク
// =============================================================================

// ========================
// $dir_dist クリーンアップ
// ========================

gulp.task('clean', () => {
  return del([
    dir_dist + '/*'
  ], {
    dot: true
  });
});

gulp.task('mkdir:dist', () => {
  return child_process('mkdir ' + dir_dist, (err, stdout, stderr) => {});
});

// ================
// ローカルサーバー
// ================

gulp.task('server', () => {
  return gulp.src(dir_dist)

  .pipe(
    webserver({
      host: 'localhost',
      // host: '0.0.0.0', // IPアクセスでローカルネットワークから接続できる
      port: 8000,
      livereload: true,
      open: 'http://localhost:8000' + server_root
    })
  );

});

// ======================
// アイドリングメッセージ
// ======================

gulp.task('idling', () => {
  return gulp.src(dir_dist)

  .pipe(
    notify('起動処理が完了しました。以降は常駐状態でファイルの更新を監視しファイル保存時にタスクを実行します。ターミナルの常駐は[Ctrl+C]で停止できます。')
  );

});

// =============================================================================
// ビルドタスク
// =============================================================================

// ====================
// 静的ファイルをコピー
// ====================

gulp.task('copy', () => {
  return gulp.src(file_copy, {
    base: dir_src + '/',
    dot: true
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ===========
// ビルド HTML
// ===========

gulp.task('build:HTML', () => {
  return gulp.src(file_build_html, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // Linter
  .pipe(
    htmlhint('.htmlhintrc')
  )
  .pipe(
    htmlhint.reporter()
  )

  // Minify
  .pipe(
    gulp_if(html_minify_flag,
      gulp_if(run_build,
        htmlmin({
          collapseWhitespace: true
        })
      )
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ==========
// ビルド Pug
// ==========

gulp.task('build:Pug', () => {
  return gulp.src(file_build_pug, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // Pug
  .pipe(
    gulp_if(html_minify_flag,
      gulp_if(run_build,
        pug(),
        pug({
          pretty: true
        })
      ),
      pug({
        pretty: true
      })
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ==============
// ビルド PostCSS
// ==============

gulp.task('build:PostCSS', () => {
  return gulp.src(file_build_postcss, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.init()
    )
  )

  // stylelint
  .pipe(
    stylelint({
      reporters: [{
        formatter: 'string',
        console: true
      }]
    })
  )

  // ベンダープレフィクス付与
  .pipe(
    autoprefixer()
  )

  // PostCSS
  .pipe(
    postcss([
      postcss_import(),
      postcss_mixins(),
      postcss_extend(),
      postcss_nested(),
      postcss_custom_properties(),
      postcss_flexbugs_fixes(),
      postcss_will_change(),
      postcss_calc()
    ])
  )

  // minify
  .pipe(
    gulp_if(run_build,
      postcss([
        postcss_csswring()
      ])
    )
  )

  // 拡張子変更
  .pipe(
    rename((path) => {
      path.extname = '.css'
    })
  )

  // SourceMaps (write)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.write('./')
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ===========
// ビルド SASS
// ===========

gulp.task('build:SASS', () => {
  return gulp.src(file_build_sass, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.init()
    )
  )

  // stylelint
  .pipe(
    stylelint({
      reporters: [{
        formatter: 'string',
        console: true
      }]
    })
  )

  // ベンダープレフィクス付与
  .pipe(
    autoprefixer()
  )

  // SASS
  .pipe(
    gulp_if(run_dev,
      sass({
        outputStyle: 'expanded'
      }),
      sass({
        outputStyle: 'compressed'
      })
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.write('./')
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// =================
// ビルド JavaScript
// =================

gulp.task('build:JavaScript', () => {
  return gulp.src(file_build_javascript, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.init()
    )
  )

  // ESLint
  .pipe(
    eslint()
  )
  .pipe(
    eslint.format()
  )
  .pipe(
    eslint.failAfterError()
  )

  // Minify
  .pipe(
    gulp_if(run_build,
      uglify({
        output: {
          comments: /^!/
        }
      })
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.write('./')
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// =================
// ビルド ECMAScript
// =================

gulp.task('build:ECMAScript', () => {
  return gulp.src(file_build_ecmascript, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.init()
    )
  )

  // ESLint
  .pipe(
    eslint()
  )
  .pipe(
    eslint.format()
  )
  .pipe(
    eslint.failAfterError()
  )

  // Babel
  .pipe(
    babel({
      presets: ['@babel/preset-env']
    })
  )

  // Minify
  .pipe(
    gulp_if(run_build,
      uglify({
        output: {
          comments: /^!/
        }
      })
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.write('./')
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// =================
// ビルド TypeScript
// =================

gulp.task('build:TypeScript', () => {
  return gulp.src(file_build_typescript, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // SourceMaps (init)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.init()
    )
  )

  // TypeScript
  .pipe(
    typescript({
      target: 'ES5'
    })
  )

  // Minify
  .pipe(
    gulp_if(run_build,
      uglify({
        output: {
          comments: /^!/
        }
      })
    )
  )

  // SourceMaps (write)
  .pipe(
    gulp_if(run_dev,
      sourcemaps.write('./')
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ===========
// ビルド JSON
// ===========

gulp.task('build:JSON', () => {
  return gulp.src(file_build_json, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // Minify
  .pipe(
    gulp_if(json_minify_flag,
      gulp_if(run_build,
        jsonminify()
      )
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});

// ==========
// ビルド img
// ==========

gulp.task('build:img', () => {
  return gulp.src(file_build_img, {
    base: dir_src + '/'
  })

  .pipe(
    plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    })
  )

  .pipe(
    changed(dir_dist)
  )

  // Optimize
  .pipe(
    gulp_if(run_build,
      imagemin([
        imagemin_pngquant({
          quality: '40-70',
          speed: 1,
          floyd: 0
        }),
        imagemin.optipng(),
        imagemin.gifsicle(),
        imagemin.svgo()
      ])
    )
  )

  .pipe(
    gulp.dest(dir_dist)
  );

});
