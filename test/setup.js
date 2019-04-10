require('@babel/register')({
  extensions: ['.ts', '.d.ts', '.tsx', '.js', '.jsx', '.json'],
  presets: [
    ['@babel/env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: ['babel-plugin-react-require'],
  cache: false
});
require('ignore-styles');
