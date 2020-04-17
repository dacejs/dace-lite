#!/usr/bin/env node

import program from 'commander';
import '../utils/check-node-version';
import '../utils/check-env-profile';
import '../utils/env';

program
  .option('-s, --silent', '禁用所有输出信息')
  .command('start', '启动本地服务', { isDefault: true })
  .command('build', '编译工程')
  .parse(process.argv);
