
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/error-handling/ErrorBoundary'
import ErrorFallback from './components/error-handling/ErrorFallback'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary 
    fallback={<ErrorFallback error={new Error("An error occurred while rendering the application")} />}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
