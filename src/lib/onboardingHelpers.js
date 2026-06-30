// lib/onboardingHelpers.js

export function updateNestedState(state, id, updates) {
  return state.map(item => (item.id === id ? { ...item, ...updates } : item));
}

export function updateNestedAddon(state, foodId, addonId, updates) {
  return state.map(f => {
    if (f.id !== foodId) return f;
    return {
      ...f,
      addons: (f.addons || []).map(a =>
        a.id === addonId ? { ...a, ...updates } : a
      ),
    };
  });
}

export function updateNestedOption(state, foodId, addonId, optIdx, updates) {
  return state.map(f => {
    if (f.id !== foodId) return f;
    const newAddons = (f.addons || []).map(a => {
      if (a.id !== addonId) return a;
      const opts = (a.options || []).map((opt, j) =>
        j === optIdx ? { ...opt, ...updates } : opt
      );
      return { ...a, options: opts };
    });
    return { ...f, addons: newAddons };
  });
}

export function optimizeCloudinaryUrl(url) {
  if (!url || url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

export function cleanPrice(val) {
  if (!val) return 0;
  return parseInt(String(val).replace(/,/g, '')) || 0;
}

export const CLOUD_NAME = 'deexaiik4';
export const UPLOAD_PRESET = 'BizUploads';