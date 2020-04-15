import React, { Reducer } from 'react';
import { Helmet } from 'react-helmet';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import serialize from 'serialize-javascript';
import Express from 'express';
import createStore from './createStore';
import document from './document';

interface SsrMiddlewareOptions {
  Component: any;
  name: string;
  reducer?: Reducer<any, any>;
}

// eslint-disable-next-line max-len
export default (options: SsrMiddlewareOptions) => async (req: Express.Request, res: Express.Response) => {
  const { Component, name, reducer } = options;
  let Markup;
  let state;
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
    state = '{}';
  }

  const markup = renderToString(Markup);
  const styleTags = '';
  const scriptTags = `<script src="http://localhost:3001/js/${name}.js"></script>`;
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
