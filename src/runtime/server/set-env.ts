import fs from 'fs';
import path from 'path';

const { PROFILE } = process.env;

const dotenvFiles = [
  path.resolve(`profiles/${PROFILE}/dace.env`),
  path.resolve(__dirname, '../../../env/dace.env')
];

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    // eslint-disable-next-line global-require
    require('dotenv').config({
      path: dotenvFile
    });
  } else {
    console.warn(`Not found dot env: \`${dotenvFile}\``);
  }
});

// 读 dace.config.js 中的配置
const daceConfigFile = path.resolve('dace.config.js');
const daceConfig = fs.existsSync(daceConfigFile) ? require(daceConfigFile) : {};
// `modify` 不加入环境变量
const excludeKeys = ['modify'];
Object.keys(daceConfig)
  .filter((key) => excludeKeys.indexOf(key) === -1)
  .forEach((key) => {
    if (!(key in process.env)) {
      process.env[key] = daceConfig[key];
    }
  });

process.env.DACE_PATH_STATS_JSON = path.resolve(
  process.env.DACE_PATH_CLIENT_DIST!,
  process.env.DACE_STATS_JSON!
);
