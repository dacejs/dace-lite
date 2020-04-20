import fs from 'fs';
import path from 'path';
import WebpackBar from 'webpackbar';
import nodeExternals from 'webpack-node-externals';
import StartServerPlugin from 'start-server-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import getEntries from '../utils/get-entries';

export default ({
  webpack,
  daceConfig,
  target = 'web',
  isDev = true,
  program = {}
}: CreateConfigOptions) => {
  const {
    DACE_HOST,
    DACE_PORT,
    DACE_STATS_JSON,
    DACE_PUBLIC_PATH,
    DACE_VENDORS,
    DACE_LONG_TERM_CACHING,
    DACE_LONG_TERM_CACHING_LENGTH,
    DACE_SERVER_MINIMIZE,
    DACE_CLIENT_MINIMIZE,
    DACE_PATH_SERVER_ENTRY,
    DACE_PATH_CLIENT_DIST,
    DACE_PATH_SERVER_DIST,
    DACE_INSPECT_BRK,
    DACE_INSPECT
  } = process.env;
  const devServerPort = Number(DACE_PORT) + 1;
  const isNode = target === 'node';
  const isWeb = target === 'web';
  const webpackHotPoll = 'webpack/hot/poll?300';
  const getHash = (hash: string) => {
    if (DACE_LONG_TERM_CACHING === 'true') {
      return `.[${hash}:${DACE_LONG_TERM_CACHING_LENGTH}]`;
    }
    return '';
  };

  // 获取 postcss 配置
  const postcssRc = path.resolve('postcss.config.js');
  const hasPostcssRc = fs.existsSync(postcssRc);
  const mainPostcssOptions: any = { ident: 'postcss' };
  if (hasPostcssRc) {
    // if (isWeb) {
    //   console.log('Using custom postcss.config.js');
    // }
    // 只能指定 postcss.config.js 所在的目录
    mainPostcssOptions.config = {
      path: path.dirname(postcssRc)
    };
  } else {
    mainPostcssOptions.plugins = [
    ];
  }

  let config: any = {
    mode: isDev ? 'development' : 'production',
    target,
    devtool: 'none',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          exclude: [
            /\.html$/,
            /\.(js|jsx|mjs)$/,
            /\.(ts|tsx)$/,
            /\.(vue)$/,
            /\.(less)$/,
            /\.(re)$/,
            /\.(s?css|sass)$/,
            /\.json$/,
            /\.bmp$/,
            /\.gif$/,
            /\.jpe?g$/,
            /\.png$/
          ],
          loader: require.resolve('file-loader'),
          options: {
            name: `media/[name]${getHash('hash')}.[ext]`,
            emitFile: true
          }
        },
        // 'url' loader works like 'file' loader except that it embeds assets
        // smaller than specified limit in bytes as data URLs to avoid requests.
        // A missing `test` is equivalent to a match.
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: `media/[name]${getHash('hash')}.[ext]`,
            emitFile: true
          }
        },
        {
          test: /\.css$/,
          // eslint-disable-next-line no-nested-ternary
          use: isNode ? [
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1
              }
            }
          ] : (isDev ? [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1
              }
            },
            {
              loader: require.resolve('postcss-loader'),
              options: mainPostcssOptions
            }
          ] : [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                modules: false
              }
            },
            {
              loader: require.resolve('postcss-loader'),
              options: mainPostcssOptions
            }
          ])
        }
      ]
    }
  };

  if (isNode) {
    config.entry = [
      path.resolve(DACE_PATH_SERVER_ENTRY)
    ];

    config.output = {
      path: path.resolve(DACE_PATH_SERVER_DIST),
      filename: 'server.js',
      libraryTarget: 'commonjs2'
    };

    config.node = {
      __dirname: false,
      __filename: false
    };

    config.externals = [
      // modules that should not be bundled
      nodeExternals({
        // 需要被打包到 bundle.js 的模块名称白名单
        whitelist: [
          webpackHotPoll,
          // /ssrMiddleware/,
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/
        ].filter(Boolean)
      })
    ];

    config.plugins = [
      ...config.plugins,
      // 防止 node 编译时打成多个包
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ];

    config.optimization = { minimize: DACE_SERVER_MINIMIZE === 'true' };

    if (isDev) {
      config.watch = true;
      config.entry.unshift(webpackHotPoll);

      const nodeArgs = ['-r', 'source-map-support/register'];

      // Passthrough --inspect and --inspect-brk flags (with optional [host:port] value) to node
      if (DACE_INSPECT_BRK) {
        nodeArgs.push(DACE_INSPECT_BRK);
      } else if (DACE_INSPECT) {
        nodeArgs.push(DACE_INSPECT);
      }

      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin(),
        // Supress errors to console (we use our own logger)
        // StartServerPlugin 会出 DeprecationWarning: Buffer()
        new StartServerPlugin({
          name: 'server.js',
          nodeArgs
        }),
        // 不监视编译输出目录，避免重新压缩死循环
        new webpack.WatchIgnorePlugin([
          path.resolve(DACE_PATH_CLIENT_DIST),
          path.resolve(DACE_PATH_SERVER_DIST)
        ])
      ];
    }
  }

  if (isWeb) {
    config.entry = getEntries();
    config.output = {
      path: path.resolve(DACE_PATH_CLIENT_DIST),
      libraryTarget: 'var'
    };

    config.plugins = [
      ...config.plugins,
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.resolve(DACE_PATH_CLIENT_DIST),
          path.resolve(DACE_PATH_SERVER_DIST)
        ]
      }),
      new StatsWriterPlugin({
        filename: DACE_STATS_JSON,
        stats: {
          all: false,
          assets: true,
          publicPath: true
        }
      })
    ];

    const vendorPattern = new RegExp(`(${DACE_VENDORS})`);
    config.optimization = {
      minimize: false,
      splitChunks: {
        cacheGroups: {
          // 禁用 cacheGroups(test/priority/reuseExistingChunk)默认配置
          default: false,

          // 禁用 vendors
          vendors: false,

          // 打包 vendor.js
          vendor: {
            name: 'vendor',
            test: vendorPattern,
            chunks: 'all',
            enforce: true
          },

          // 打包 styles.css
          styles: {
            name: 'styles',
            test: /\.(css|less|scss)$/,
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }

        }
      }
    };

    if (isDev) {
      config.output = {
        ...config.output,
        publicPath: `http://${DACE_HOST}:${devServerPort}/`,
        pathinfo: true,
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].chunk.js'
      };

      config.devServer = {
        headers: {
          'Access-Control-Allow-Origin': `http://${DACE_HOST}:${DACE_PORT}`,
          'Access-Control-Allow-Credentials': true
        },
        host: '0.0.0.0',
        hot: true,
        port: devServerPort,
        quiet: false,
        writeToDisk: (filepath: string) => filepath.endsWith(DACE_STATS_JSON),
        watchOptions: {
          ignored: /node_modules/
        }
      };

      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin({
          multiStep: true
        })
      ];
    } else { // web-build
      config.output = {
        ...config.output,
        publicPath: DACE_PUBLIC_PATH,
        filename: `js/[name]${getHash('chunkhash')}.js`,
        chunkFilename: `js/[name]${getHash('chunkhash')}.chunk.js`
      };

      config.plugins = [
        ...config.plugins,
        // Extract our CSS into a files.
        new MiniCssExtractPlugin({
          filename: `css/[name]${getHash('contenthash')}.css`,
          chunkFilename: `css/[name].[id]${getHash('contenthash')}.css` // ,
          // allChunks: true because we want all css to be included in the main
          // css bundle when doing code splitting to avoid FOUC:
          // https://github.com/facebook/create-react-app/issues/2415
          // allChunks: true
        }),
        new webpack.HashedModuleIdsPlugin() // ,
        // new webpack.optimize.AggressiveMergingPlugin()
      ];
      config.optimization = { ...config.optimization, minimize: DACE_CLIENT_MINIMIZE === 'true' };
    }
  }

  if (isDev && !program.verbose) {
    config.plugins = [
      ...config.plugins,
      new WebpackBar({
        color: target === 'web' ? '#f5a623' : '#9013fe',
        name: target === 'web' ? 'client' : 'server'
      })
    ];
  }

  // 项目中的配置文件优先级最高
  if (daceConfig?.modify) {
    config = daceConfig.modify(config, { target, isDev }, webpack);
  }

  return config;
};
