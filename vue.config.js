const { defineConfig } = require('@vue/cli-service')

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/webgis-demo/' : '/',
  configureWebpack: {
    devtool: 'source-map',
    output: {
      sourcePrefix: ''
    },
    resolve: {
      fallback: { "https": false, "zlib": false, "http": false, "url": false },
      mainFiles: ['index', 'Cesium']
    },
    plugins: [
      // Copy Cesium Assets, Widgets, and Workers to a static directory
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
          { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
          { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
          { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
        ]
      }),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('')
      })
    ],
  }
})
