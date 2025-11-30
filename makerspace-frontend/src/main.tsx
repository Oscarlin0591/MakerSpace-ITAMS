import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import {CookiesProvider} from "react-cookie";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
          <App />
      </CookiesProvider>
  </StrictMode>
);
