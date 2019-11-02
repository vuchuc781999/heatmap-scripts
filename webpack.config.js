const path = require('path');

module.exports = {
  entry: ['@babel/polyfill', './src/app.js'],
  output:  {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};