const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: './'
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'global': 'globalThis',
      'process.env': JSON.stringify(process.env),
      'process.env.ELECTRON': '"true"' // 标记为 Electron 环境
    }),
    new webpack.ProvidePlugin({
      global: 'globalThis'
    })
  ],
  // 关键：不将任何模块标记为 external，让所有模块都被打包
  externals: [],
  // 关键：node 配置
  node: {
    __dirname: false, // 使用真实的 __dirname
    __filename: false // 使用真实的 __filename
  },
  optimization: {
    minimize: true
  }
}