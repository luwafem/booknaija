// src/pages/OnboardingSuccess.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OnboardingSuccess() {
  const location = useLocation();
  const bizData = location.state;

  // 1. Try to get from React Router state, fallback to sessionStorage (survives refresh)
  const businessName = (bizData && bizData.businessName) 
    ? bizData.businessName 
    : sessionStorage.getItem('new_biz_name') || 'Your Business';
    
  const businessSlug = (bizData && bizData.businessSlug) 
    ? bizData.businessSlug 
    : sessionStorage.getItem('new_biz_slug');

  // 2. Build a full absolute URL (e.g., https://yourdomain.com/biz/slug)
  const businessPath = businessSlug ? `/${businessSlug}` : null;
  const fullBusinessUrl = businessPath ? `${window.location.origin}${businessPath}` : null;

  const [copied, setCopied] = useState(false);

  // 3. Clean up sessionStorage when the user leaves this page
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('new_biz_slug');
      sessionStorage.removeItem('new_biz_name');
    };
  }, []);

  function handleCopyLink() {
    if (!fullBusinessUrl) return;
    navigator.clipboard.writeText(fullBusinessUrl).then(function() {
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 2500);
    }).catch(function() {
      // Fallback for older browsers
      prompt("Copy this link:", fullBusinessUrl);
    });
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
      <div className="relative z-10 text-center max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl shadow-sm">
        
        {/* Checkmark */}
        <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">You're all set!</h2>
        <p className="text-zinc-500 leading-relaxed mb-6">
          Your page for <span className="font-semibold text-zinc-800">{businessName}</span> is being built and deployed right now.
        </p>

        {/* 30 Minute Notice */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-400 mb-1">Deploying now</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                It typically takes a few minutes to go live. Please check back in <span className="font-bold">30 minutes</span> to ensure everything is fully active.
              </p>
            </div>
          </div>
        </div>

        {/* Business Link Section */}
        {fullBusinessUrl && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-4 text-left">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Business Link</p>
            
            {/* URL Display */}
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-2.5 mb-3">
              <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-xs text-zinc-700 truncate flex-1 font-mono">{fullBusinessUrl}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a 
                href={fullBusinessUrl} 
                className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Page
              </a>
              
              <button 
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <Link to="/" className="inline-flex items-center justify-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3.5 rounded-xl text-sm font-semibold transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}