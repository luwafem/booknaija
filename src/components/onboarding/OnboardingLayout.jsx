// src/components/onboarding/OnboardingLayout.jsx
import { Link } from 'react-router-dom';

export default function OnboardingLayout({ children, steps, currentStep }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white">
      {/* Header */}
      <nav className="bg-white sticky top-0 z-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Manage Business
            </Link>
            <Link to="/signup" className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-xs text-zinc-500">
                {steps.find(s => s.id === currentStep)?.title}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-center gap-1.5 mt-3 md:hidden">
              {steps.map(step => (
                <button
                  key={step.id}
                  type="button"
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep === step.id ? 'bg-white w-4' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/50">
              <h2 className="text-lg font-bold text-white">
                {steps.find(s => s.id === currentStep)?.title}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                {steps.find(s => s.id === currentStep)?.desc}
              </p>
            </div>
            <div className="p-6">
              {children}
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
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
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
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