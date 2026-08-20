// src/lib/logging.js
import * as Sentry from '@sentry/react';

export async function logAdminError(source, message, metadata = {}) {
  // Always log to console for local debugging
  console.error(`[Admin Error] ${source}:`, message, metadata);

  // Send to Sentry
  Sentry.captureException(new Error(message), {
    tags: { source, component: 'AdminDashboard' },
    extra: metadata,
  });

  // Optionally send to the server to persist in system_logs
  try {
    await fetch('/.netlify/functions/admin-log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'error', source, message, metadata }),
    });
  } catch (_) {
    // Silently fail – logging is best‑effort
  }
}