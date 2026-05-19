import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OnboardingSuccess() {
  const location = useLocation();
  const bizData = location.state;

  const businessName = (bizData && bizData.businessName)
    ? bizData.businessName
    : sessionStorage.getItem('new_biz_name') || localStorage.getItem('new_biz_name') || 'Your Business';

  const businessSlug = (bizData && bizData.businessSlug)
    ? bizData.businessSlug
    : sessionStorage.getItem('new_biz_slug') || localStorage.getItem('new_biz_slug');

  const businessPath = businessSlug ? `/${businessSlug}` : null;
  const fullBusinessUrl = businessPath ? `${window.location.origin}${businessPath}` : null;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('new_biz_slug');
      sessionStorage.removeItem('new_biz_name');
      localStorage.removeItem('new_biz_slug');
      localStorage.removeItem('new_biz_name');
    };
  }, []);

  function handleCopyLink() {
    if (!fullBusinessUrl) return;
    navigator.clipboard.writeText(fullBusinessUrl).then(function() {
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 2500);
    }).catch(function() {
      prompt("Copy this link:", fullBusinessUrl);
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white">
      
      {/* Header - White background (matching landing page) */}
      <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/fav-removebg.png" 
              alt="BookNaija Logo" 
              className="h-9 w-auto object-contain" 
            />
          </Link>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link 
              to="/dashboard"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Manage Business
            </Link>
            <Link 
              to="/signup" 
              className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-8 text-center">
            
            {/* Success Icon */}
            
            <h2 className="text-xl font-bold text-white mb-2">You're all set!</h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Your page for <span className="font-semibold text-white">{businessName}</span> is being built and deployed right now.
            </p>

            {/* Deploying Notice */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-5 text-left">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-300 mb-1">Deploying now</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    It typically takes a few minutes to go live. Please check back in <span className="font-medium text-white">30 minutes</span> to ensure everything is fully active.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Link Card */}
            {fullBusinessUrl && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-5 text-left">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Business Link</p>
                
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 mb-3">
                  <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs text-zinc-300 truncate flex-1 font-mono">{fullBusinessUrl}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={fullBusinessUrl} 
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 text-zinc-900 py-2.5 rounded-lg text-xs font-semibold transition-colors"
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
                    className="flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

            {/* CTA Button */}
            <Link 
              to="/" 
              className="inline-flex items-center justify-center w-full bg-white hover:bg-zinc-200 text-zinc-900 py-3.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Helper Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-zinc-500">
              Need help? <Link to="/support" className="text-zinc-300 hover:text-white transition-colors">Contact Support</Link>
            </p>
            <p className="text-xs text-zinc-500">
              <Link to="/dashboard" className="text-zinc-300 hover:text-white transition-colors">Go to Dashboard</Link> to manage your business
            </p>
          </div>
        </div>
      </main>

      {/* Footer - White background (matching landing page) */}
      <footer className="bg-white border-t border-zinc-200 pt-12 pb-8 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <Link to="/" className="flex items-center">
                <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-10 w-auto object-contain" />
              </Link>
            </div>
            
            <div className="flex gap-10 text-sm">
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</p>
                <ul className="space-y-2">
                  <li><Link to="/#pricing" className="text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link></li>
                  <li><Link to="/#features" className="text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link></li>
                  <li><Link to="/signup" className="text-zinc-600 hover:text-zinc-900 transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Partners</p>
                <ul className="space-y-2">
                  <li><Link to="/affiliate-signup" className="text-zinc-700 font-medium hover:text-zinc-900 transition-colors">Affiliate</Link></li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</p>
                <ul className="space-y-2">
                  <li><Link to="/blog" className="text-zinc-600 hover:text-zinc-900 transition-colors">Blog</Link></li>
                  <li><Link to="/privacy" className="text-zinc-600 hover:text-zinc-900 transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="text-zinc-600 hover:text-zinc-900 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-4 items-center">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} BookNaija Technologies.
            </p>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link to="/terms" className="hover:text-zinc-700 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-zinc-700 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}