import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import program from 'commander';
import clearConsole from 'react-dev-utils/clearConsole';
import { measureFileSizesBeforeBuild, printFileSizesAfterBuild, OpaqueFileSizes } from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import createConfig from '../webpack/create-config';

program.parse(process.argv);

const { DACE_PATH_CLIENT_DIST } = process.env;

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

function build(previousFileSizes: OpaqueFileSizes) {
  let daceConfig = {};

  const daceConfigFile = path.resolve('dace.config.js');
  if (fs.existsSync(daceConfigFile)) {
    try {
      // eslint-disable-next-line global-require
      daceConfig = require(daceConfigFile);
    } catch (e) {
      clearConsole();
      console.error(`Invalid dace.config.js file. ${e}`);
      process.exit(1);
    }
  }

  const clientConfig = createConfig({ webpack, daceConfig, target: 'web', isDev: false, program });
  const serverConfig = createConfig({ webpack, daceConfig, target: 'node', isDev: false, program });

  console.log('Creating an optimized production build...');
  if (program.verbose) {
    console.log('Client build config:');
    console.dir(clientConfig, { showHidden: true, depth: 10 });
  }
  console.log('Compiling client...');

  return new Promise((resolve, reject) => {
    compile(clientConfig, (clientError: Error, clientStats: webpack.Stats) => {
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

      compile(serverConfig, (serverError: Error, serverStats: webpack.Stats) => {
        if (serverError) {
          return reject(serverError);
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

      return null;
    });
  });
}

measureFileSizesBeforeBuild(DACE_PATH_CLIENT_DIST!)
  .then((previousFileSizes: OpaqueFileSizes) => build(previousFileSizes))
  .then(
    ({ stats, previousFileSizes, warnings }: any) => {
      if (warnings.length > 0) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`);
        console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`);
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }
      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(stats, previousFileSizes, DACE_PATH_CLIENT_DIST!);
      console.log();
    },
    (err: Error) => {
      console.log(chalk.red('Failed to compile.\n'));
      console.log(`${err.message || err}\n`);
      process.exit(1);
    }
  );
