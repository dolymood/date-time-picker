var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var pkg = require('./package.json')

module.exports = {
  entry: {
    'date-picker': './src/date.js',
    'time-picker': './src/time.js',
    'date-time-picker': './src/date+time.js'
  },
  output: {
    path: path.join(__dirname, './dev'),
    filename: '[name].min.js',
    library: pkg.library,
    libraryTarget: 'umd'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      }
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'example.html',
      template: 'example/index.html',
      inject: false
    }),
    new ExtractTextPlugin(pkg.name + '.min.css')
  ],
  devtool: false
}
