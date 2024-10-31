// config/webpack.config.js

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    background: './src/background/service-worker.js',
    content: './src/content/content.js',
    sidepanel: './src/panel/sidepanel.js',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry'
  },
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    clean: true // Clean the output directory before emit
  },

  mode: process.env.NODE_ENV || 'development',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: 'json-loader'
      },
      {
        test: /pdf\.worker\.entry$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'pdf.worker.js', // Fixed name for easier referencing
            esModule: false
          }
        }
      },
      {
        test: /\.xml$/,
        use: 'raw-loader'
      }
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/data/dictionaries',
          to: 'data/dictionaries'
        },
        {
          from: 'src/panel/sidepanel.html',
          to: 'sidepanel.html'
        },
        {
          from: 'src/styles',
          to: 'styles'
        },
        {
          from: 'manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'images',
          to: 'images'
        },
        // Add PDF.js and Mammoth related files
        {
          from: 'node_modules/pdfjs-dist/cmaps/',
          to: 'cmaps/'
        },
        {
          from: 'node_modules/pdfjs-dist/standard_fonts/',
          to: 'standard_fonts/'
        },
        {
          from: 'node_modules/mammoth/mammoth.browser.min.js',
          to: 'lib/mammoth.browser.min.js'
        }
      ]
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    },
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "process": require.resolve("process/browser"),
      "fs": false,
      "crypto": false
    }
  },

  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,

  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    splitChunks: {
      chunks: 'all',
      name: false,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};