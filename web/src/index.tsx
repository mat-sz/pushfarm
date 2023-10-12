import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Kreds from '@kreds/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { kreds } from './common';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Kreds.Provider client={kreds}>
        <Kreds.Modal />
        <App />
      </Kreds.Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);

serviceWorkerRegistration.register();
