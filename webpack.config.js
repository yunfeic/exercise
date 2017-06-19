var path = require('path')
var fs = require('fs')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var StringReplacePlugin = require('string-replace-webpack-plugin')

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
  entry: entryFiles,
  output: {
    filename: '[name].js',
    publicPath: '/static/',
    path: path.join(__dirname, '/build/static/')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([ 'css-loader', 'postcss-loader' ])
        // use: [ 'css-loader', 'postcss-loader' ]
      }, {
        test: /\.less$/,
        use: ExtractTextPlugin.extract([ 'css-loader', 'postcss-loader', 'less-loader' ])
        // use: [ 'style-loader', 'css-loader', 'postcss-loader', 'less-loader' ]
      }, {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: StringReplacePlugin.replace({
              replacements: replacements
          })
      }, {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /(node_modules)/
      }
      ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new StringReplacePlugin(),
  ]
}