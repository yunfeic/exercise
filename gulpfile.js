var path = require('path')
var gulp = require('gulp')
var del = require('del')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var gulpSequence = require('gulp-sequence')
var htmlmin = require("gulp-htmlmin")
var webpack = require('webpack')
var webpackDevServer = require('webpack-dev-server')
var webpackOnBuildPlugin = require('on-build-webpack')

var moment = require('moment')
var colors = require('colors')
var _ = require('lodash')

var webpackConfig = require('./webpack.config')
var envConfig = require('./config/env')

var env = 'dev'
var compiler = ''
var host = 'h5.dev.weidian.com'
var port = 8082

var nowTime = function (format) {
  return moment().format(format || "HH:mm:ss");
};

gulp.task("clean", function() {
  var delPath = del.sync('./build')
})

gulp.task('assets', function () {
  gulp.src('assets/*.*')
    .pipe(gulp.dest('build/static/assets'))
})

gulp.task('html', function () {
  var gulpStream = gulp.src('pages/*/*.html')
    .pipe(rename(function (path) {
      path.basename = path.dirname;
      path.dirname = ''
    }))
    .pipe(replace(/\$\$_cdnUrl_\$\$/ig, envConfig[env].cdnUrl))

  if (!/dev/.test(env)) {
    gulpStream.pipe(htmlmin({
      minifyJS: true,
      minifyCSS: true,
      collapseWhitespace: true,
      removeComments: true
    }))
  }

  gulpStream.pipe(gulp.dest('build/pages'))
})

gulp.task("watch", ["html"], function() {
  gulp.watch(["pages/*/*.html"], function() {
    gulp.start("html");
  });
});

gulp.task('webpack', function () {
  if (/dev/.test(env)) {
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // webpackConfig.plugins.push(new webpackOnBuildPlugin(function (stats) {
    //   var statJson = stats.toJson({errorDetails: true, assets: true, cached: true});
    //   if (stats.hasErrors()) {
    //     console.error('[' + nowTime() + '] ' + colors.red('构建出错......'));
    //     console.error("\n" + colors.red(statJson.errors));
    //     return;
    //   }
    //
    //   console.log('[' + nowTime() + '] ' + colors.green('构建成功,构建结果资源如下:'));
    //   var asserts = [];
    //   _.forEach(statJson.assets, function (assert, index) {
    //     asserts.push('[' + nowTime() + '] ' + "|---- " + colors.green(host + ':' + port + '/pages/'));
    //   });
    //   console.log(asserts.join("\n"));
    //
    // }));
  }

  console.log('[' + nowTime() + '] ' + colors.green(env + '环境,开始进行webpack打包'));
  compiler = webpack(webpackConfig);
  return new Promise(function(resolve, reject) {
    if (/dev/.test(env)) {
      compiler.watch(200, bundle);
    } else {
      compiler.run(bundle);
    }

    function bundle(err, stats) {
      if (err) {
        console.log('[' + nowTime() + '] ' + colors.red(env + '环境,webpack打包出错'));
        console.log(err);
        return reject(err);
      }

      console.log('[' + nowTime() + '] ' + colors.green(env + '环境,webpack打包成功'));
      return resolve();
    }
  });
})

gulp.task('build', function(cb) {
  if(/dev/.test(env)){
    gulpSequence('html', 'watch', 'assets', 'webpack', cb)
  }else{
    gulpSequence('clean', 'html', 'assets', 'webpack', cb)
  }
});

gulp.task('start', ['build'], function() {
  for(let k in webpackConfig.entry) {
    webpackConfig.entry[k].unshift("webpack-dev-server/client?http://h5.dev.weidian.com:8082", "webpack/hot/dev-server")
  }
  var server = new webpackDevServer(compiler, {
    contentBase: path.join(__dirname, 'build'),
    hot: true,
    historyApiFallback: true,
    disableHostCheck: true,

    quiet: false,
    noInfo: false,
    stats: {
      chunks: false,
      colors: true
    },
    // It's a required option.
    publicPath: webpackConfig.output.publicPath,
  });
  server.listen(port);
});

gulp.task('dev', function(cb) {
  env = 'dev'
  gulp.start("start");
});

gulp.task("devPre", function() {
  env = 'devPre';
  gulp.start("start");
});

gulp.task("daily", function() {
  env = 'daily';
  gulp.start("build");
});

gulp.task("pre", function() {
  env = 'pre';
  gulp.start("build");
});

gulp.task("prod", function() {
  env = 'prod';
  gulp.start("build");
});

