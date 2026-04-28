import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardLogin() {
  var navigate = useNavigate();
  var slugArr = useState('');
  var slug = slugArr[0];
  var setSlug = slugArr[1];
  var errorArr = useState('');
  var error = errorArr[0];
  var setError = errorArr[1];

  function handleSubmit(e) {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Please enter your business slug.');
      return;
    }
    var clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) {
      setError('Invalid slug format.');
      return;
    }
    setError('');
    navigate('/dashboard/' + clean);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/">
            <img src="/fav-removebg.png" alt="BookNaija" className="h-16 w-auto mx-auto object-contain mb-6" />
          </a>
          <h1 className="text-xl font-bold text-zinc-900">Manage Your Business</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your business slug to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Business Slug</label>
            <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <span className="px-3 text-sm text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none">booknaija.com/</span>
              <input
                type="text"
                value={slug}
                onChange={function(e) { setSlug(e.target.value); }}
                placeholder="your-business-slug"
                className="flex-1 px-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all active:scale-[0.98]"
          >
            Open Dashboard
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-zinc-400">
          Don't have a business yet?{' '}
          <a href="/signup" className="text-purple-600 font-semibold hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  );
}