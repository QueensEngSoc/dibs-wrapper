const path = require('path');

const baseConfig = require('./webpack.config.base');

const distPath = path.resolve(__dirname, '../public');

const config = {
  ...baseConfig,
  entry: {
    app: './src/client/client.tsx'
  },
  output: {
    filename: '[name].bundle.js',
    path: distPath,
    publicPath: '/public'
  },
  plugins: [
    ...baseConfig.plugins
  ]
};

module.exports = config;
