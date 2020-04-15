#!/usr/bin/env node

import program from 'commander';
import '../utils/env';
import '../utils/check-node-version';

program
  .option('-s, --silent', '禁用所有输出信息')
  .command('start', '启动本地服务', { isDefault: true })
  .command('build', '编译工程')
  .parse(process.argv);
