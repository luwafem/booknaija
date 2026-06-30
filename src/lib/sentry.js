// src/lib/sentry.js
import * as Sentry from '@sentry/react';
import packageJson from '../../package.json';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const enabled = dsn && (
    import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true'
  );

  if (!enabled) {
    if (import.meta.env.DEV) {
      console.log('🔍 Sentry disabled – set VITE_SENTRY_DSN and VITE_SENTRY_ENABLED=true');
    }
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    release: `booknaija@${packageJson.version}`,
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          const sensitiveParams = ['token', 'code', 'state', 'ref', 'key', 'auth', 'password'];
          for (const param of sensitiveParams) {
            if (url.searchParams.has(param)) {
              url.searchParams.delete(param);
            }
          }
          event.request.url = url.toString();
        } catch {}
      }
      event.tags = {
        ...event.tags,
        app: 'booknaija',
        environment: import.meta.env.VITE_ENVIRONMENT || 'production',
      };
      return event;
    },
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Script error\.?$/,
      /^Blocked a frame with origin/,
    ],
  });

  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason || event);
  });

  // ─── Expose Sentry globally for testing in development ───
  if (import.meta.env.DEV) {
    window.Sentry = Sentry;
  }

  console.log('✅ Sentry initialized with release:', packageJson.version);
}

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;

export function setUserContext(userId, email, name) {
  Sentry.setUser({ id: userId, email, name });
}

export function clearUserContext() {
  Sentry.setUser(null);
}