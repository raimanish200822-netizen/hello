import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import { AdminProvider } from './context/AdminContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ToastProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </ToastProvider>
  </ErrorBoundary>
);
