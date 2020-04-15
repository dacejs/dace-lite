#!/usr/bin/env node

import program from 'commander';
import '../utils/env';

const currentNodeVersion = process.versions.node;
const [major] = currentNodeVersion.split('.');

const majorVersion = 10;

if (Number(major) < majorVersion) {
  console.error(`You are running Node ${currentNodeVersion}.
Dace requires Node ${majorVersion} or higher.
Please update your version of Node.
`);
  process.exit(1);
}

program
  .option('-s, --silent', '禁用所有输出信息')
  .command('start', '启动本地服务', { isDefault: true })
  .command('build', '编译工程')
  .parse(process.argv);
