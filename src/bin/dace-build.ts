import fs from 'fs';
import chalk from 'chalk';
import webpack from 'webpack';
import program from 'commander';
import clearConsole from 'react-dev-utils/clearConsole';
import { measureFileSizesBeforeBuild, printFileSizesAfterBuild } from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import logger from '../utils/logger';
import createConfig from '../webpack/createConfig';

// TODO 提取到 index.d.ts
declare global {
  namespace NodeJS {
    interface Process {
      noDeprecation: boolean;
    }
  }
}

process.noDeprecation = true; // 关闭告警信息，避免对进度条显示产生干扰

program.parse(process.argv);

const { DACE_PATH_CONFIG, DACE_PATH_CLIENT_DIST } = process.env;

// 捕捉 webpack 编译过程中的错误
function compile(config: webpack.Configuration, cb: Function) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (e) {
    console.error('Failed to compile.', [e]);
    process.exit(1);
  }
  compiler.run((err, stats) => {
    cb(err, stats);
  });
}

function build(previousFileSizes) {
  let daceConfig = {};

  if (fs.existsSync(DACE_PATH_CONFIG)) {
    try {
      daceConfig = require(DACE_PATH_CONFIG);
    } catch (e) {
      clearConsole();
      logger.error(`Invalid dace.config.js file. ${e}`);
      process.exit(1);
    }
  }

  const clientConfig = createConfig({ webpack, daceConfig, target: 'web', isDev: false });
  const serverConfig = createConfig({ webpack, daceConfig, target: 'node', isDev: false });

  console.log('Creating an optimized production build...');
  if (program.verbose) {
    console.log('Client build config:');
    console.dir(clientConfig, { showHidden: true, depth: 10 });
  }
  console.log('Compiling client...');

  return new Promise((resolve, reject) => {
    compile(clientConfig, (clientError, clientStats) => {
      if (clientError) {
        reject(clientError);
      }
      const clientMessages = formatWebpackMessages(clientStats.toJson({}, true));
      if (clientMessages.errors.length > 0) {
        return reject(new Error(clientMessages.errors.join('\n\n')));
      }

      console.log(chalk.green('Compiled client successfully.'));

      if (program.verbose) {
        console.log('Server build config:');
        console.dir(serverConfig, { showHidden: true, depth: 10 });
      }
      console.log('Compiling server...');

      compile(serverConfig, (serverError, serverStats) => {
        if (serverError) {
          reject(serverError);
        }
        const serverMessages = formatWebpackMessages(serverStats.toJson({}, true));
        if (serverMessages.errors.length > 0) {
          return reject(new Error(serverMessages.errors.join('\n\n')));
        }
        console.log(chalk.green('Compiled server successfully.'));
        return resolve({
          stats: clientStats,
          previousFileSizes,
          warnings: {
            ...clientMessages.warnings,
            ...serverMessages.warnings
          }
        });
      });
    });
  });
}

measureFileSizesBeforeBuild(DACE_PATH_CLIENT_DIST)
  .then((previousFileSizes) => build(previousFileSizes))
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length > 0) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`);
        console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`);
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }
      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(stats, previousFileSizes, DACE_PATH_CLIENT_DIST);
      console.log();
    },
    (err: Error) => {
      console.log(chalk.red('Failed to compile.\n'));
      console.log(`${err.message || err}\n`);
      process.exit(1);
    }
  );
