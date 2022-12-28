import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import { globalStyles } from './styles/globalStyles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {globalStyles()}
    <Popup />
  </React.StrictMode>,
);
