var path = require('path')
var fs = require('fs')

var gulp = require('gulp')
var del = require('del')
var rename = require('gulp-rename')
var replace = require('gulp-replace')
var gulpSequence = require('gulp-sequence')
var htmlmin = require("gulp-htmlmin")
var htmlone = require('gulp-htmlone')
var webpack = require('webpack')
var webpackDevServer = require('webpack-dev-server')
var webpackOnBuildPlugin = require('on-build-webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

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

gulp.task('dist', function () {
  gulp.src('dist/*.*')
    .pipe(gulp.dest('build/static/dist'))
})

gulp.task('html', function () {
  var gulpStream = ''

  if (!/dev/.test(env)) {
    gulpStream = gulp.src('pages/*/*.html')
      .pipe(rename(function (path) {
        path.basename = path.dirname;
        path.dirname = ''
      }))
      .pipe(replace(/\$\$_cdnUrl_\$\$/ig, envConfig[env].cdnUrl))
      .pipe(htmlone({
        keepliveSelector: '.keep'
      }))
      .pipe(htmlmin({
        minifyJS: true,
        minifyCSS: true,
        collapseWhitespace: true,
        removeComments: true
      }))
  }else{
    gulpStream = gulp.src('pages/*/*.html')
      .pipe(rename(function (path) {
        path.basename = path.dirname;
        path.dirname = ''
      }))
      .pipe(replace(/\$\$_cdnUrl_\$\$/ig, envConfig[env].cdnUrl))
  }

  gulpStream.pipe(gulp.dest('build/pages'))
})

gulp.task("watch", ["html"], function() {
  gulp.watch(["pages/*/*.html"], function() {
    gulp.start("html");
  });
});

gulp.task('webpack', function () {
  if (!/dev/.test(env)) {
    webpackConfig.output.publicPath = envConfig[env].cdnUrl + '/';
    webpackConfig.output.filename = '[name].[chunkhash:8].js';
    webpackConfig.output.chunkFilename = '[name].[chunkhash:8].js';
    webpackConfig.plugins.push(new ExtractTextPlugin('[name].[chunkhash:8].css'));
    webpackConfig.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: true
        }
      })
    );
  }else{
    webpackConfig.devtool = 'cheap-module-eval-source-map'
    webpackConfig.plugins.push(new ExtractTextPlugin('[name].css'));
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
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

gulp.task('hash', function(){
  var res = fs.readFileSync(path.join(__dirname, 'stats.json'), 'utf8');
  var statsData = JSON.parse(res);
  var pagesDir = path.join(__dirname, '/build/pages/');
  var dirs = fs.readdirSync(pagesDir);
  dirs.forEach(function (v, i) {
    var file = fs.readFileSync(path.join(pagesDir, v), 'utf8');
    var fileKeyWord = v.match(/(\S+).html/)[1];
    var k = `${fileKeyWord}/index`;
    var fnJsHash = ''
    var fnCssHash = ''

    if(typeof statsData.assetsByChunkName[k] === 'string'){
      fnJsHash = statsData.assetsByChunkName[k];
    }else{
      fnJsHash = statsData.assetsByChunkName[k][0];
      fnCssHash = statsData.assetsByChunkName[k][1];
    }
    var replaceJsReg = new RegExp(`(<script[\\s\\S]+)${k}.js`);
    var htmlOutput = file.replace(replaceJsReg, `$1${fnJsHash}`);

    if(fnCssHash){
      replaceCssReg = new RegExp(`(<link[\\s\\S]+)${k}.css`);
      htmlOutput = htmlOutput.replace(replaceCssReg, `$1${fnCssHash}`);
    }

    fs.writeFileSync(path.join(pagesDir, v), htmlOutput, { encoding: 'utf8' });
    console.log(`Add hash in ${v}`);
  })
})

gulp.task('build', function(cb) {
  if(/dev/.test(env)){
    gulpSequence('html', 'watch', 'dist', 'webpack', cb)
  }else{
    gulpSequence('clean', 'html', 'dist', 'webpack', 'hash', cb)
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

