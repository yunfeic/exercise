var path = require('path')
var fs = require('fs')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var StringReplacePlugin = require('string-replace-webpack-plugin')
var webpack = require('webpack')

var mappingConfig = require('./config/mapping')
var envConfig = require('./config/env')

var pageDir = process.cwd() + '/pages';
var entryFilesArray = fs.readdirSync(pageDir);
var entryFiles = {};

entryFilesArray.forEach(function (file) {
  var state = fs.statSync(pageDir + '/' + file);
  if (state.isDirectory(file)) {
    var dirname = path.basename(file);
    entryFiles[dirname + '/index'] = [
      path.join(__dirname, './pages/' + dirname + '/index.js')
    ]
  }
});

var replacements = []
for(var key in mappingConfig){
  var replacement = getReplacement(key)
  replacements.push(replacement)
}

function getReplacement(host) {
  return {
    pattern: new RegExp('\\$\\$_' + host + '_\\$\\$', 'ig'),
    replacement: function (match, p1, offset, string) {
      return envConfig[process.env.WEBPACK_ENV][host]
    }
  }
}

module.exports = {
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'eval',
  entry: entryFiles,
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/static/',
    path: path.join(__dirname, '/build/static/')
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([ 'css-loader', 'postcss-loader' ])
        // use: [ 'css-loader', 'postcss-loader' ]
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract([ 'css-loader', 'postcss-loader', 'less-loader' ])
        // use: [ 'style-loader', 'css-loader', 'postcss-loader', 'less-loader' ]
      },
      {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: StringReplacePlugin.replace({
              replacements: replacements
          })
      },
      // {
      //   enforce: "pre",
      //   test: /\.js$/,
      //   exclude: /(node_modules)/,
      //   use: "eslint-loader",
      // },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /(node_modules)/
      }

      ]
  },
  plugins: [
    // new ExtractTextPlugin('[name].css'),
    new StringReplacePlugin(),
    function() {
      this.plugin("done", function(stats) {
        require("fs").writeFileSync(
          path.join(__dirname, "stats.json"),
          JSON.stringify(stats.toJson()));
      });
    },
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          configFile: './.eslintrc'
        },
      }
    })

  ],
}