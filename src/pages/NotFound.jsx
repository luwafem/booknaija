import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../hooks/useSEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        noIndex={true}
      />

      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          
          <h1 
            className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter text-zinc-100 select-none"
            aria-hidden="true"
          >
            404
          </h1>
          
          <div className="-mt-12 md:-mt-16 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
              Page not found
            </h2>
            <p className="text-zinc-500 text-base leading-relaxed">
              The page you're looking for doesn't exist, has been moved, or the business link is no longer active.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-all active:scale-95"
            >
              Go to Homepage
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto text-sm font-semibold text-zinc-600 hover:text-zinc-900 px-8 py-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all active:scale-95"
            >
              Create Your Storefront
            </Link>
          </div>

          <p className="mt-8 text-xs text-zinc-400">
            If you think this is a mistake, please{' '}
            <a 
              href="mailto:support@booknaija.com" 
              className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
            >
              contact support
            </a>.
          </p>
        </div>
      </div>
    </>
  );
}