import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (process.env.NODE_ENV !== 'production') {
  const originalError = console.error.bind(console);
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
      console.group('%c🚨 DUPLICATE KEY DETECTED IN REACT', 'color: red; font-size: 14px; font-weight: bold;');
      originalError(...args);
      console.trace('Duplicate key call stack:');
      console.groupEnd();
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

