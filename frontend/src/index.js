import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BrewingSystem from './BrewingSystem';
import AppLayout from './AppLayout';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppLayout>
      <BrewingSystem />
    </AppLayout>
  </React.StrictMode>
);
