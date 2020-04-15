import path from 'path';
import nodeExternals from 'webpack-node-externals';
import StartServerPlugin from 'start-server-webpack-plugin';
import getEntries from '../utils/get-entries';

export default ({
  webpack,
  daceConfig,
  target = 'web',
  isDev = true // ,
  // program = {}
}) => {
  const {
    DACE_HOST,
    DACE_PORT // ,
    // NODE_PATH = '',
    // DACE_PUBLIC_PATH,
    // DACE_VENDORS,
    // DACE_LONG_TERM_CACHING,
    // DACE_LONG_TERM_CACHING_LENGTH,
    // // DACE_PATH_ROOT,
    // DACE_SERVER_MINIMIZE,
    // DACE_CLIENT_MINIMIZE,
    // DACE_POLYFILL,
    // DACE_HMR,
    // DACE_BABEL_COMPILE_MODULES,
    // DACE_PATH_BABEL_RC,
    // DACE_PATH_ESLINT_RC,
    // DACE_PATH_POSTCSS_RC,
    // DACE_PATH_NODE_MODULES,
    // DACE_PATH_CLIENT_ENTRY,
    // DACE_PATH_SERVER_ENTRY,
    // DACE_PATH_CLIENT_DIST,
    // DACE_PATH_SERVER_DIST,
    // DACE_INSPECT_BRK,
    // DACE_INSPECT
  } = process.env;
  const isNode = target === 'node';
  const isWeb = target === 'web';
  const webpackHotPoll = 'webpack/hot/poll?300';
  const getHash = (hash) => {
    // if (DACE_LONG_TERM_CACHING === 'true') {
    //   return `.[${hash}:${DACE_LONG_TERM_CACHING_LENGTH}]`;
    // }
    return '';
  };

  // 将 process.env 中所有以 DACE_ 开头的变量传递到代码运行时环境
  const daceEnv = Object.keys(process.env)
    .filter((key) => key.startsWith('DACE_'))
    .reduce((envs, key) => {
      envs[`process.env.${key}`] = JSON.stringify(process.env[key]);
      return envs;
    }, {});

  let config: any = {
    mode: isDev ? 'development' : 'production',
    // context: process.cwd(),
    target,
    devtool: 'none',
    resolve: {
      // modules: ['node_modules', DACE_PATH_NODE_MODULES].concat((NODE_PATH).split(path.delimiter).filter(Boolean)),
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
      new webpack.DefinePlugin(daceEnv)
    ],
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }]
    }
  };

  if (isNode) {
    config.entry = [path.resolve(__dirname, '../runtime/server.ts')];

    config.output = {
      filename: 'server.js',
      libraryTarget: 'commonjs2'
    };

    config.node = {
      __dirname: false,
      __filename: false
    };

    config.externals = [
      nodeExternals({
        whitelist: [
          webpackHotPoll,
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/
        ].filter(Boolean)
      })
    ];

    config.plugins = [
      // 将定义环境变量传递到运行时环境
      // new webpack.DefinePlugin(daceEnv),
      // 防止 node 编译时打成多个包
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ];

    if (isDev) {
      config.watch = true;

      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin(),
        // Supress errors to console (we use our own logger)
        // StartServerPlugin 会出 DeprecationWarning: Buffer()
        new StartServerPlugin({
          name: 'server.js'
        }),
        // 不监视编译输出目录，避免重新压缩死循环
        new webpack.WatchIgnorePlugin(['prd', 'dist'])
      ];

      config.entry.unshift(webpackHotPoll);
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
  }

  if (isWeb) {
    config.entry = getEntries();
    config.output = {
      path: path.resolve('prd'),
      libraryTarget: 'var'
    };

    if (isDev) {
      config.output = {
        ...config.output,
        publicPath: 'http://localhost:3001/',
        pathinfo: true,
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].chunk.js'
      };

      config.devServer = {
        disableHostCheck: true,
        headers: {
          'Access-Control-Allow-Origin': `http://${DACE_HOST}:${DACE_PORT}`,
          'Access-Control-Allow-Credentials': true
        },
        host: '0.0.0.0',
        hot: true,
        noInfo: false,
        overlay: false,
        port: 3001,
        quiet: false,
        watchOptions: {
          ignored: /node_modules/
        }
      };

      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin()
      ];
    }
  }

  // 项目中的配置文件优先级最高
  if (daceConfig?.modify) {
    config = daceConfig.modify(config, { target, isDev }, webpack);
  }

  return config;
};
