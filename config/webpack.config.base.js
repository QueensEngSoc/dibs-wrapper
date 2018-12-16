const webpack = require('webpack');
const path = require('path');

const srcPath = path.resolve(__dirname, '../');
const env = process.env.NODE_ENV === 'dev' ? 'development' : 'production';
const isProduction = env === 'production';

module.exports = {
  mode: env,
  context: srcPath,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    symlinks: false
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ],
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: /node_modules\/.*/
      }
    ]
  },
  devtool: isProduction ? false : 'source-map'
};
