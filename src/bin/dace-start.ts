import fs from 'fs';
import path from 'path';
import program from 'commander';
import DevServer from 'webpack-dev-server';
import webpack from 'webpack';
import createConfig from '../webpack/createConfig';

// interface DaceConfigOptions {
//   modify?: Function
// }

program
  .option('-v, --verbose', '显示详细日志信息')
  .parse(process.argv);

// 捕获 webpack 执行过程中的错误
function compile(config: webpack.Configuration) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (e) {
    console.error(`Failed to compile: ${e}`);
    process.exit(1);
  }
  return compiler;
}

function main() {
  const { DACE_PORT } = process.env;
  const daceConfigFile = path.resolve('dace.config.js');
  let daceConfig = {};

  if (fs.existsSync(daceConfigFile)) {
    try {
      // eslint-disable-next-line global-require
      daceConfig = require(daceConfigFile);
    } catch (e) {
      console.error('Invalid dace.config.js file.', e);
      process.exit(1);
    }
  }

  const clientConfig = createConfig({ webpack, daceConfig, target: 'web', isDev: true, program });
  const serverConfig = createConfig({ webpack, daceConfig, target: 'node', isDev: true, program });

  // Compile our assets with webpack
  const clientCompiler = compile(clientConfig);
  const serverCompiler = compile(serverConfig);

  // 在确保浏览器端编译成功后再启动服务器端编译
  clientCompiler.hooks.done.tap('abc', (stats) => {
    if (stats.compilation.errors.length === 0 && stats.compilation.warnings.length === 0) {
      serverCompiler.watch({}, () => {});
    } else {
      console.error('Client build failed.');
    }
  });

  // Create a new instance of Webpack-dev-server for our client assets.
  // This will actually run on a different port than the users app.
  const clientDevServer = new DevServer(clientCompiler, clientConfig.devServer);

  // Start Webpack-dev-server
  const devPort = Number(DACE_PORT) + 1;
  clientDevServer.listen(devPort, (err: any) => {
    if (err) {
      console.error(err);
    }
  });
}

main();
