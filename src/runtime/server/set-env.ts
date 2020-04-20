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

process.env.DACE_PATH_STATS_JSON = path.resolve(
  process.env.DACE_PATH_CLIENT_DIST,
  process.env.DACE_STATS_JSON
);
