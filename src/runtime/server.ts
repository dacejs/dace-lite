import express from 'express';
import chalk from 'chalk';

const { DACE_PORT = 3000, DACE_HOST = 'localhost' } = process.env;
let app = require('./createServer').default;

if (module.hot) {
  module.hot.accept('./createServer', () => {
    console.log('🔁  HMR Reloading `./createServer`...');
    try {
      // eslint-disable-next-line global-require
      app = require('./createServer').default;
    } catch (error) {
      console.error(error);
    }
  });
  console.log('✅  Server-side HMR Enabled!');
}

export default express()
  .use((req, res) => app.handle(req, res))
  .listen(DACE_PORT, () => {
    const url = chalk.underline(`http://${DACE_HOST}:${DACE_PORT}`);
    console.log(`\n🐟 Your application is running at ${url}`);
  });
