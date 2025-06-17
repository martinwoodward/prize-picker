const path = require('path');
const fs = require('fs');
const Webpack = require('webpack');
const { merge } = require('webpack-merge');
const dotenv = require('dotenv');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WorkboxPlugin = require('workbox-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const getClientEnvironment = require('./utils/env');

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  path.resolve(__dirname, '../.env.production.local'),
  path.resolve(__dirname, '../.env.production'),
  path.resolve(__dirname, '../.env')
].filter((dotenvFile) => fs.existsSync(dotenvFile));

console.log(`${dotenvFiles[0]} will be used.\n`);

// Load env variables
dotenv.config({
  path: dotenvFiles[0]
});

const clientEnv = getClientEnvironment('production');

module.exports = merge(baseWebpackConfig, {
  mode: 'production',
  target: 'browserslist',
  stats: 'errors-only',
  bail: true,
  output: {
    filename: 'assets/js/[name].[chunkhash:8].js',
    chunkFilename: 'assets/js/[name].[chunkhash:8].chunk.js'
  },
  plugins: [
    new Webpack.DefinePlugin(clientEnv.stringified),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[chunkhash:8].css'
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: false,
      skipWaiting: false,
      // Cache busting strategy
      cacheId: `prize-picker-${process.env.APP_VERSION || 'v1'}-${process.env.APP_BUILD_TIMESTAMP || Date.now()}`,
      // Define what to cache and what not to cache
      exclude: [
        /\.map$/,
        /manifest$/,
        /bundle-analyzer-plugin-report\.html$/
      ],
      // Runtime caching for dynamic content
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.github\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'github-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }
          }
        }
      ],
      // Clean up old caches
      cleanupOutdatedCaches: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../bundle-analyzer-plugin-report.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              envName: 'production'
            }
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false
              }
            }
          }
        ]
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            envName: 'production'
          }
        }]
      },
      {
        test: /\.s?css/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: [
                  autoprefixer(),
                  cssnano(
                    {
                      preset: ['default', {
                        discardComments: {
                          removeAll: true
                        }
                      }]
                    }
                  )
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
});
