// src/data/templates.js

/**
 * Defines available page templates per business type.
 * The 'value' corresponds to the `template` field stored in the database.
 * The 'label' is shown to the business owner in the dashboard dropdown.
 */
export const TEMPLATE_OPTIONS = {
  // ─── Real Estate ──────────────────────────────────────────
  'Real Estate': [
    { value: 'default', label: 'Classic' },
    // Future templates:
    // { value: 'modern', label: 'Modern' },
    // { value: 'minimalist', label: 'Minimalist' },
  ],

  // ─── Shortlet ────────────────────────────────────────────
  'Shortlet': [
    { value: 'default', label: 'Classic' },
  ],

  // ─── Fallback for any other business type ────────────────
  // If we later add templates for Beauty, Auto, Food, etc.,
  // we can add new keys here. The system will fall back to this
  // if the business type is not explicitly listed.
  fallback: [
    { value: 'default', label: 'Default' },
  ],
};