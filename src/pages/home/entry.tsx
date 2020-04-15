import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import reducer from './reducer';
import Page from './Home';
import createStore from '../../runtime/createStore';

const initialState = window.INITIAL_STATE || {};
const store = createStore(reducer, initialState);

hydrate((
  <Provider store={store}>
    <Page store={store} />
  </Provider>
), document.getElementById('root'));
