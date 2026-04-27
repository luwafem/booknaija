// src/pages/OnboardingSuccess.jsx
import { Link } from 'react-router-dom';

export default function OnboardingSuccess() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex items-center justify-center px-6 relative">
      <div className="relative z-10 text-center max-w-sm bg-white border border-zinc-200 p-10 rounded-2xl">
        <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">All Done!</h2>
        <p className="text-zinc-500 leading-relaxed mb-6">
          Your inventory details have been sent. We will review them and build your page.
        </p>
        <Link to="/" className="inline-flex items-center justify-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3.5 rounded-xl text-sm font-semibold transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}