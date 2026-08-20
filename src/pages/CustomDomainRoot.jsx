import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomDomainRoot() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    // Skip if we are on the main domain (five9.com.ng or localhost)
    if (host === 'five9.com.ng' || host === 'localhost' || host === '127.0.0.1') {
      // If root path on main domain, maybe go to landing page
      navigate('/');
      return;
    }

    // Otherwise, look up the slug for this domain
    const lookup = async () => {
      try {
        const res = await fetch(`/.netlify/functions/domain-lookup?host=${host}`);
        if (!res.ok) {
          throw new Error('Domain not mapped');
        }
        const { slug } = await res.json();
        // Redirect to the business page (keeping the custom domain)
        navigate(`/${slug}`, { replace: true });
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // Optionally redirect to main landing or show 404
        navigate('/'); // fallback
      }
    };
    lookup();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return null; // Should redirect before rendering
}