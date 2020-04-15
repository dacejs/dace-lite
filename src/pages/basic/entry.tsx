import React from 'react';
import { hydrate } from 'react-dom';
import Page from './Basic';

hydrate((
  <Page />
), document.getElementById('root'));
