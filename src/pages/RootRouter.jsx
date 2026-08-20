import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';

export default function RootRouter() {
  const [loading, setLoading] = useState(true);
  const [isMainDomain, setIsMainDomain] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    const mainDomains = ['five9.com.ng', 'localhost', '127.0.0.1'];

    if (mainDomains.includes(host)) {
      setIsMainDomain(true);
      setLoading(false);
      return;
    }

    const lookup = async () => {
      try {
        const res = await fetch(`/.netlify/functions/domain-lookup?host=${host}`);
        if (!res.ok) {
          // Domain not mapped – redirect to main domain
          window.location.href = 'https://five9.com.ng';
          return;
        }
        const { slug } = await res.json();
        navigate(`/${slug}`, { replace: true });
      } catch {
        window.location.href = 'https://five9.com.ng';
      } finally {
        setLoading(false);
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

  return isMainDomain ? <Landing /> : null;
}