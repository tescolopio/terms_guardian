const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry:{
    background: ['url-polyfill', './src/background/service-worker.js'],
    content: ['url-polyfill', './src/content/content.js'],
    sidepanel: ['url-polyfill', './src/panel/sidepanel.js']
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    },
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "process": require.resolve("process/browser"),
      "url": false,
      "util": false,
      "fs": false,
      "crypto": false
    }
  },
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': false,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new CopyPlugin({
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
        {
          from: 'node_modules/pdfjs-dist/build/pdf.worker.mjs',
          to: 'pdf.worker.entry.mjs'
        },
        {
          from: 'node_modules/pdfjs-dist/cmaps/',
          to: 'cmaps/'
        }
      ]
    })
  ],
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    splitChunks: {
      chunks: 'all',
      name: false,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
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
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    clean: true
  }
};