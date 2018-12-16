const path = require('path');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.config.base');

const distPath = path.resolve(__dirname, '../dist');

module.exports = {
  ...baseConfig,
  entry: './app.js',
  output: {
    path: distPath,
    filename: 'server.js'
  },
  target: 'node',
  node: {
    __dirname: true,
    __filename: false
  },
  externals: nodeExternals(),
  devtool: 'source-map'
};
