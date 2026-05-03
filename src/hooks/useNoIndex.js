import { useEffect } from 'react';

/**
 * Prevent search engines from indexing protected/dashboard pages
 */
export function useNoIndex() {
  useEffect(() => {
    // Add noindex meta tag
    let metaTag = document.querySelector('meta[name="robots"]');
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = 'noindex, nofollow';
    
    return () => {
      // Restore when leaving dashboard
      if (metaTag) {
        metaTag.content = 'index, follow';
      }
    };
  }, []);
}