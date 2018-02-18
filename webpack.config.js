const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  entry: {
    default: path.resolve(__dirname, 'firefox.css'),
    example: path.resolve(__dirname, 'example/example.scss')
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /(.scss|.css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true,
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                ident: 'postcss',
                plugins: () => [
                  /* eslint-disable global-require */
                  require('autoprefixer'),
                  require('postcss-initial')(),
                  require('postcss-prepend-selector')({ selector: '#embedded.embedded ' }),
                  /* eslint-enable global-require */
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                includePaths: [
                  path.join(__dirname),
                  path.join(__dirname, 'node_modules'),
                ],
              },
            },
          ],
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].min.css',
      allChunks: true,
    }),
    new OptimizeCssAssetsPlugin(),
  ],
};
