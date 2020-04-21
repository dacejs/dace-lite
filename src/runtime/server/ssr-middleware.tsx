import React, { Reducer } from 'react';
import { Helmet } from 'react-helmet';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import serialize from 'serialize-javascript';
import Express from 'express';
import createStore from '../create-store';
import document from './document';

interface SsrMiddlewareOptions {
  Component: any;
  chunkName: string;
  reducer?: Reducer<any, any>;
}

// eslint-disable-next-line max-len
export default (options: SsrMiddlewareOptions) => async (req: Express.Request, res: Express.Response) => {
  const {
    DACE_SSR,
    DACE_PATH_STATS_JSON,
    DACE_SCRIPT_CROSSORIGIN
  } = process.env;
  // const statsJson = path.
  const { Component, chunkName, reducer } = options;
  const isSSR = DACE_SSR === 'true';
  const isCrossOrigin = DACE_SCRIPT_CROSSORIGIN === 'true';

  // 拼接 script 和 link
  let styleTags = '';
  let scriptTags = '';
  /**
   * "assetsByChunkName": {
    "vendor": "js/vendor.9d2deb9d.chunk.js",
    "basic": "js/basic.8d7c0add.js",
    "home": [
      "css/home.3314833e.css",
      "js/home.bce2eceb.js"
    ]
  },
  */
  let webpackStats: any;
  try {
    // eslint-disable-next-line global-require
    webpackStats = require(DACE_PATH_STATS_JSON!);
  } catch (error) {
    console.error(`Not found '${DACE_PATH_STATS_JSON}'`);
    process.exit(1);
  }
  const { assetsByChunkName, publicPath } = webpackStats;
  if (assetsByChunkName) {
    Object.keys(assetsByChunkName)
      .filter((key: string) => ['vendor', chunkName].includes(key))
      .forEach((key: string) => {
        // 包装成数组统一处理
        if (!Array.isArray(assetsByChunkName[key])) {
          assetsByChunkName[key] = [assetsByChunkName[key]];
        }
        assetsByChunkName[key].forEach((filename: string) => {
          const src = publicPath + filename;
          if (filename.endsWith('.css')) {
            styleTags = `${styleTags}<link type="text/css" href="${src}" rel="stylesheet" />`;
          }
          if (filename.endsWith('.js')) {
            const crossorigin = isCrossOrigin ? ' crossorigin="anonymous"' : '';
            scriptTags = `${scriptTags}<script src="${src}"${crossorigin}></script>`;
          }
        });
      });
  }

  let Markup = <></>;
  let state = '{}';
  if (isSSR) {
    if (options.reducer) {
      const initialStore = {};
      const store = createStore(reducer, initialStore, req);
      if (Component.getInitialProps) {
        const ctx = { store, req, res };
        await Component.getInitialProps(ctx);
      }
      Markup = (
        <Provider store={store}>
          <Component store={store} />
        </Provider>
      );
      state = serialize(store.getState());
    } else {
      Markup = <Component />;
    }
  }
  const markup = renderToString(Markup);
  const head = Helmet.renderStatic();
  const html = document({
    head,
    markup,
    state,
    styleTags,
    scriptTags
  });
  res.status(200).end(html);
};
