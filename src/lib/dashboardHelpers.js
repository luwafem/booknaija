export function uid(prefix = '') {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefix}${time}${rand}`;
}

export function optimizeCloudinaryUrl(url) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

export const CLOUD_NAME = 'deexaiik4';
export const UPLOAD_PRESET = 'BizUploads';