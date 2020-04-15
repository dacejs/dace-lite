import fs from 'fs';
import program from 'commander';
import chalk from 'chalk';
import DevServer from 'webpack-dev-server';
import webpack from 'webpack';
import createConfig from '../webpack/createConfig';

// TODO 提取到 index.d.ts
declare global {
  namespace NodeJS {
    interface Process {
      noDeprecation: boolean;
    }
  }
}

interface DaceConfigOptions {
  modify?: Function
}

program
  // .option('-s, --silent', '禁用所有输出信息')
  // .option('-v, --verbose', '显示详细日志信息')
  .parse(process.argv);

process.noDeprecation = true; // 关闭告警信息，避免对进度条显示产生干扰

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
  const { DACE_PATH_CONFIG } = process.env;
  let daceConfig:DaceConfigOptions = {};

  if (fs.existsSync(DACE_PATH_CONFIG)) {
    try {
      daceConfig = require(DACE_PATH_CONFIG);
    } catch (e) {
      console.error('Invalid dace.config.js file.', e);
      process.exit(1);
    }
  }

  const clientConfig = createConfig({ webpack, daceConfig, target: 'web', isDev: true });
  const serverConfig = createConfig({ webpack, daceConfig, target: 'node', isDev: true });

  // Compile our assets with webpack
  const clientCompiler = compile(clientConfig);
  const serverCompiler = compile(serverConfig);

  // 在确保浏览器端编译成功后再启动服务器端编译
  clientCompiler.plugin('done', (stats) => {
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
  const devPort = 3001;
  clientDevServer.listen(devPort, (err: any) => {
    if (err) {
      console.error(err);
    }
  });
}

main();
