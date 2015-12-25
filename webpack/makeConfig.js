import ExtractTextPlugin from 'extract-text-webpack-plugin';
import NyanProgressPlugin from 'nyan-progress-webpack-plugin';
import autoprefixer from 'autoprefixer';
import constants from './constants';
import path from 'path';
import webpack from 'webpack';

// Webpack does not like npm link
// https://github.com/webpack/webpack/issues/784#issuecomment-126835731
const babelLoader = require.resolve('babel-loader');

const devtools = process.env.CONTINUOUS_INTEGRATION
  ? 'inline-source-map'
  // cheap-module-eval-source-map, because we want original source, but we don't
  // care about columns, which makes this devtool faster than eval-source-map.
  // http://webpack.github.io/docs/configuration.html#devtool
  : 'cheap-module-eval-source-map';

const loaders = {
  'css': '',
  'less': '!less-loader',
  'scss': '!sass-loader',
  'sass': '!sass-loader?indentedSyntax',
  'styl': '!stylus-loader'
};

export default function makeConfig(isDevelopment, entryName) {

  function stylesLoaders() {
    return Object.keys(loaders).map(ext => {
      const prefix = 'css-loader!postcss-loader';
      const extLoaders = prefix + loaders[ext];
      const loader = isDevelopment
        ? `style-loader!${extLoaders}`
        : ExtractTextPlugin.extract('style-loader', extLoaders);
      return {
        loader: loader,
        test: new RegExp(`\\.(${ext})$`)
      };
    });
  }

  let entry = {};
  if (entryName) {
    entry = {
      [entryName]: isDevelopment ? [
        `webpack-hot-middleware/client?path=http://localhost:${constants.HOT_RELOAD_PORT}/__webpack_hmr`,
        path.join(constants.SRC_DIR, `${entryName}.js`)
      ] : [
        path.join(constants.SRC_DIR, `${entryName}.js`)
      ]
    }
  } else {
    entry = {
      app: isDevelopment ? [
        `webpack-hot-middleware/client?path=http://localhost:${constants.HOT_RELOAD_PORT}/__webpack_hmr`,
        path.join(constants.SRC_DIR, 'app.js')
      ] : [
        path.join(constants.SRC_DIR, 'app.js')
      ]
    }
  } 

  const config = {
    hotPort: constants.HOT_RELOAD_PORT,
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: isDevelopment ? devtools : '',
    entry: entry,
    module: {
      loaders: [{
        loader: 'url-loader?limit=100000',
        test: /\.(gif|jpg|png|woff|woff2|eot|ttf|svg)$/
      }, {
        exclude: /node_modules/,
        loaders: ['babel'],
        test: /\.js$/
      }].concat(stylesLoaders())
    },
    output: isDevelopment ? {
      path: constants.BUILD_DIR,
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: `http://localhost:${constants.HOT_RELOAD_PORT}/build/`
    } : {
      path: constants.BUILD_DIR,
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js'
    },
    plugins: (() => {
      const plugins = [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
            IS_BROWSER: true
          }
        })
      ];
      if (isDevelopment) plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      );
      else plugins.push(
        // Render styles into separate cacheable file to prevent FOUC and
        // optimize for critical rendering path.
        new ExtractTextPlugin('[name].css', {
          allChunks: true
        }),
        new NyanProgressPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true, // eslint-disable-line camelcase
            warnings: false // Because uglify reports irrelevant warnings.
          }
        })
      );
      return plugins;
    })(),
    postcss: () => [autoprefixer({browsers: 'last 2 version'})],
    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['src', 'node_modules'],
      root: constants.ABSOLUTE_BASE,
      alias: {
        'react$': require.resolve(path.join(constants.NODE_MODULES_DIR, 'react'))
      }
    }
  };

  return config;

};
