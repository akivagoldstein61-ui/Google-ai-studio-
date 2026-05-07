import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary';
import {initObservability} from './lib/observability';
import './index.css';

// Initialize observability (Sentry if DSN is configured, otherwise no-op)
initObservability().catch(() => {});

// intercept console.error to log a stack trace if it is about keys
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('two children with the same key')) {
    originalError(...args);
    console.trace('Duplicate key traceback');
  } else {
    originalError(...args);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
