import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppWithStudio } from './AppWithStudio';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithStudio />
  </React.StrictMode>
);
