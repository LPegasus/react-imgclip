/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require('fs');
const isProduction = process.env.NODE_ENV === 'production';
const _ = require('underscore');
const tplImpl = _.template(fs.readFileSync(path.join(__dirname, 'example', 'template.ejs'), 'utf8'));
const { CheckerPlugin } = require('awesome-typescript-loader')
const pages = [];

const entries = fs.readdirSync(path.resolve(process.cwd(), 'example', 'entry'))
  .reduce((res, filename) => {
    if (/.+\.tsx?$/.test(filename)) {
      const name = filename.replace(/\.tsx?/, '');
      pages.push({
        name,
        pathname: path.join(__dirname, 'example', name + '.html'),
      });
      return Object.assign({}, res, { [name]: `./example/entry/${name}` });
    }
    return res;
  }, {});

pages.forEach(function(cfg) {
  const code = tplImpl(cfg);
  fs.writeFile(cfg.pathname, code, function(err) {
    if (err) {
      console.error(err);
      return;
    }
  });
});

const plugins = [
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new CheckerPlugin(),
  new ExtractTextPlugin({
    filename: '[name].css'
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin()
  // uglifyJSPlugin
];

module.exports = {
  entry: entries,
  output: {
    filename: "[name].js",
    path: __dirname + '/example/dist'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".jsx"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'awesome-typescript-loader',
            options: {
              transpileOnly: true,
              configFileName: 'tsconfig.json'
            }
          },
        ],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'example')
        ]
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  stats: {
    assets: true
  },

  watch: true,

  devServer: {
    compress: true, // enable gzip compression
    historyApiFallback: false, // true for index.html upon 404, object for multiple paths
    hot: false, // hot module replacement. Depends on HotModuleReplacementPlugin
    watchOptions: {
      // ignored: /node_modules/,
      poll: 1000
    },
    publicPath: '/example',
    port: 8080,
    stats: {
      assets: true
    },
  },

  plugins: plugins
};
