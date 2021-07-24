import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import SharedEntry from './shared';

hydrate(
  <BrowserRouter>
    <SharedEntry />
  </BrowserRouter>,
  document.getElementById('app'),
);
