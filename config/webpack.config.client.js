const path = require('path');

const baseConfig = require('./webpack.config.base');

const distPath = path.resolve(__dirname, '../public');

const config = {
  ...baseConfig,
  entry: {
    app: './client.tsx'
  },
  output: {
    filename: '[name].bundle.js',
    path: distPath,
    publicPath: '/public'
  },
  plugins: [
    ...baseConfig.plugins
  ],
  externals: {
    react: 'react',
    'react-dom': 'reactDom'
  }
};

module.exports = config;
