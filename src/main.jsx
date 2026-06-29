// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// ─── Configure React Query with stale-while-revalidate ───
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute – after that, it's "stale"
      staleTime: 60 * 1000, // 1 minute
      
      // Keep unused data in cache for 10 minutes (then it's garbage collected)
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Refetch in background when the user returns to the tab
      refetchOnWindowFocus: true,
      
      // Refetch on mount if the data is stale
      refetchOnMount: true,
      
      // Retry failed queries once
      retry: 1,
      
      // Keep previous data when fetching new data (useful for pagination, but global)
      keepPreviousData: true,
    },
  },
});

// ─── Register Service Worker (only in production) ───
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);