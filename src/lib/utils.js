export function optimizeImage(url, width = 800) {
  if (!url) return url;
  // If it's a Cloudinary URL, add q_auto,f_auto and resize
  if (url.includes('cloudinary.com')) {
    // Insert transformation before /upload/
    return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
  }
  return url;
}