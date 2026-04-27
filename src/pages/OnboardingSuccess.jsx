// src/pages/OnboardingSuccess.jsx
import { Link, useLocation } from 'react-router-dom';

export default function OnboardingSuccess() {
  const location = useLocation();
  const bizData = location.state;

  // Fallbacks just in case the user refreshes the page and state is lost
  const businessName = (bizData && bizData.businessName) ? bizData.businessName : 'Your Business';
  const businessSlug = (bizData && bizData.businessSlug) ? bizData.businessSlug : null;
  
  // Change '/biz/' if your business pages use a different route (e.g. '/store/', '/b/')
  const businessUrl = businessSlug ? `/biz/${businessSlug}` : '/';

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
      <div className="relative z-10 text-center max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl">
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">Deploying now</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                It typically takes a few minutes to go live. Please check back in <span className="font-bold">30 minutes</span> to ensure everything is fully active.
              </p>
            </div>
          </div>
        </div>

        {/* Business Link */}
        {businessSlug && (
          <a 
            href={businessUrl} 
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors mb-3"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Your Page
          </a>
        )}

        <Link to="/" className="inline-flex items-center justify-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3.5 rounded-xl text-sm font-semibold transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}