// src/lib/sentry.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// ─── Get the app version from package.json ───
// This helps track which version of the code an error occurred in.
import packageJson from '../../package.json';

export function initSentry() {
  // Only initialize in production when DSN is set and not explicitly disabled
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const enabled = import.meta.env.PROD && dsn && import.meta.env.VITE_SENTRY_ENABLED !== 'false';

  if (!enabled) {
    if (import.meta.env.DEV) {
      console.log('🔍 Sentry disabled – set VITE_SENTRY_DSN to enable');
    }
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      new BrowserTracing({
        // Only trace navigation and XHR/fetch requests that take > 200ms
        tracingOrigins: ['localhost', 'booknaija.netlify.app', /^\//],
      }),
    ],
    // Capture 10% of transactions – adjust based on your free tier
    tracesSampleRate: 0.1,
    // Capture 20% of sessions for release health
    replaysSessionSampleRate: 0.2,
    // Capture 5% of errors with replay (privacy friendly)
    replaysOnErrorSampleRate: 0.05,

    // Set the release version – helps with source maps
    release: `booknaija@${packageJson.version}`,

    // Environment (staging, production, etc.)
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',

    // Filter out sensitive data before sending
    beforeSend(event, hint) {
      // Remove user email and IP if present
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }

      // Clean URLs to remove query parameters with sensitive info (e.g., tokens)
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          // Remove known sensitive query params
          const sensitiveParams = ['token', 'code', 'state', 'ref', 'key', 'auth', 'password'];
          for (const param of sensitiveParams) {
            if (url.searchParams.has(param)) {
              url.searchParams.delete(param);
            }
          }
          event.request.url = url.toString();
        } catch {
          // If URL parsing fails, leave as is
        }
      }

      // Optional: Add custom tags for better filtering
      event.tags = {
        ...event.tags,
        app: 'booknaija',
        environment: import.meta.env.VITE_ENVIRONMENT || 'production',
      };

      return event;
    },

    // Ignore certain errors (e.g., ad-blocker related, etc.)
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Script error\.?$/,
      /^Blocked a frame with origin/,
    ],
  });

  // ─── Global unhandled rejection handler ───
  // This ensures any unhandled promise rejections are captured.
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason || event);
  });

  console.log('✅ Sentry initialized with release:', packageJson.version);
}

// ─── Exported helpers for manual error logging ───
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;

// ─── Optional: Set user context when they log in ───
export function setUserContext(userId, email, name) {
  Sentry.setUser({
    id: userId,
    email: email, // Note: email will be stripped in beforeSend if present, but it's useful for grouping
    name: name,
  });
}

// ─── Optional: Reset user context on logout ───
export function clearUserContext() {
  Sentry.setUser(null);
}