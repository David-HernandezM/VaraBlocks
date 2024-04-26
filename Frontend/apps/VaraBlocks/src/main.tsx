import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { Provider as ReactReduxProvider } from 'react-redux';
import { store } from './app/store/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactReduxProvider store={store}>
      <App />
    </ReactReduxProvider>
  </React.StrictMode>,
);
