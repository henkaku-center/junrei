const CopyPlugin = require('copy-webpack-plugin');
const HandlebarsPlugin = require('handlebars-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const paths = {
  src: {
    favicon: './src/favicon',
    fonts: './src/fonts',
    img: './src/img',
    js: './src/js',
    scss: './src/scss'
  },
  dist: {
    css: './assets/css',
    favicon: './assets/favicon',
    fonts: './assets/fonts',
    img: './assets/img',
    js: './assets/js'
  },
};

module.exports = {
  devtool: 'source-map',
  entry: {
    libs: [paths.src.scss + '/libs.scss'],
    theme: [paths.src.js + '/theme.js', paths.src.scss + '/theme.scss'],
    minter: [paths.src.js + '/minter.jsx']
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ['@babel/preset-react'] }
      },
      {
        test:  /\.(png|jpe?g|gif)$/i,
        loader: "file-loader",
      },
      {
        test: /\.(sass|scss)$/,
        include: path.resolve(__dirname, paths.src.scss.slice(2)),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['autoprefixer']],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/](node_modules)[\\/].+\.js$/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  output: {
    filename: paths.dist.js + '/[name].bundle.js',
    publicPath: '/',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: paths.src.favicon,
          to: paths.dist.favicon,
        },
        {
          from: paths.src.fonts,
          to: paths.dist.fonts,
        },
        {
          from: paths.src.img,
          to: paths.dist.img,
        }
      ],
    }),
    new HandlebarsPlugin({
      entry: path.join(process.cwd(), 'src', 'html', '**', '*.html'),
      output: path.join(process.cwd(), 'dist', '[path]', '[name].html'),
      partials: [path.join(process.cwd(), 'src', 'partials', '**', '*.{html,svg}')],
      helpers: {
        is: function (v1, v2, options) {
          const variants = v2.split(' || ');
          const isTrue = variants.some((variant) => v1 === variant);

          return isTrue ? options.fn(this) : options.inverse(this);
        },
        isnt: function (v1, v2, options) {
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        },
        webRoot: function () {
          return '{{webRoot}}';
        },
      },
      onBeforeSave: function (Handlebars, resultHtml, filename) {
        const level = filename.split('//').pop().split('/').length;
        const finalHtml = resultHtml.split('{{webRoot}}').join('.'.repeat(level));

        return finalHtml;
      },
    }),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: paths.dist.css + '/[name].bundle.css',
    }),
  ],
  target: 'web',
};
