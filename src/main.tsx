import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

import './styles/tokens.css';
import './styles/base.css';
import './styles/motion.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/cards.css';
import './styles/discovery.css';
import './styles/pages.css';
import './styles/organizer.css';
import './styles/eventbuilder.css';
import './styles/eventpublish.css';
import './styles/charts.css';
import './styles/teams.css';
import './styles/entry.css';
import './styles/responsive.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
