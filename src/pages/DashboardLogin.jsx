import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNoIndex } from '../hooks/useNoIndex';

export default function DashboardLogin() {
  var navigate = useNavigate();
  useNoIndex();
  
  var [slug, setSlug] = useState('');
  var [step, setStep] = useState(1);
  var [error, setError] = useState('');
  var [loading, setLoading] = useState(false);
  var [bizData, setBizData] = useState(null);
  var [code, setCode] = useState('');
  var [answer, setAnswer] = useState('');
  var [activeQuestion, setActiveQuestion] = useState(null);

  var inputBase = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200";

  async function handleSlugSubmit(e) {
    e.preventDefault();
    if (!slug.trim()) { setError('Please enter your business slug.'); return; }
    var clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) { setError('Invalid slug format.'); return; }
    setError(''); setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) throw new Error("Configuration missing");

      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?slug=eq.${clean}&select=name,slug,security_code,security_question_1,security_question_2,security_answer_1,security_answer_2`, {
        headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (!res.ok || data.length === 0) throw new Error('Business not found.');
      const biz = data[0];

      if (!biz.security_code) {
         sessionStorage.setItem('biz_auth_' + clean, 'setup_required');
         navigate('/dashboard/' + clean); return;
      }

      setBizData(biz);
      var questions = [];
      if (biz.security_question_1) questions.push({ q: biz.security_question_1, a: biz.security_answer_1 });
      if (biz.security_question_2) questions.push({ q: biz.security_question_2, a: biz.security_answer_2 });
      if (questions.length > 0) {
        var randIdx = Math.floor(Math.random() * questions.length);
        setActiveQuestion(questions[randIdx]);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to find business.');
    } finally { setLoading(false); }
  }

  function handleSecuritySubmit(e) {
    e.preventDefault(); setError('');
    if (!bizData) return;
    var cleanCode = code.trim();
    var cleanAnswer = answer.trim().toLowerCase();
    if (cleanCode !== bizData.security_code) { setError('Invalid security code.'); return; }
    if (activeQuestion && cleanAnswer !== activeQuestion.a) { setError('Incorrect answer to security question.'); return; }
    sessionStorage.setItem('biz_auth_' + slug, 'true');
    navigate('/dashboard/' + slug);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      
      {/* Header - White, matching landing page */}
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/fav-removebg.png" alt="BookNaija Logo" className="h-9 w-auto object-contain" />
          </Link>
          <Link to="/signup" className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content - Centered card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          
          {step === 2 ? (
            /* STEP 2: Security Check */
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-white">Verify Access</h1>
              <p className="text-sm text-zinc-400 mt-1">Logging into <span className="font-semibold text-white">{bizData?.name}</span></p>
            </div>
          ) : (
            /* STEP 1: Slug Entry */
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-white">Manage Your Business</h1>
              <p className="text-sm text-zinc-400 mt-1">Enter your business slug to access the dashboard.</p>
            </div>
          )}

          <form onSubmit={step === 2 ? handleSecuritySubmit : handleSlugSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            
            {step === 2 ? (
              /* Security Step Fields */
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">4-Digit Security Code</label>
                  <input
                    type="password" value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="••••" className={inputBase + " font-mono tracking-widest text-center text-xl"}
                    maxLength={4} inputMode="numeric" autoFocus autoComplete="one-time-code"
                  />
                </div>
                {activeQuestion && (
                  <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Security Question</label>
                    <p className="text-sm text-zinc-200 font-medium mb-2">{activeQuestion.q}</p>
                    <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" className={inputBase} autoComplete="off" />
                  </div>
                )}
                <button type="button" onClick={() => { setStep(1); setBizData(null); setError(''); }} className="w-full text-xs text-zinc-400 hover:text-white transition-colors py-2">
                  ← Back to Slug
                </button>
              </>
            ) : (
              /* Slug Step Fields */
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Business Slug</label>
                  <div className="flex items-center border border-zinc-700 rounded-xl overflow-hidden focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500 transition-all bg-zinc-800">
                    <span className="px-3 text-sm text-zinc-500 bg-zinc-800 border-r border-zinc-700 select-none">booknaija.com/</span>
                    <input
                      type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                      placeholder="your-business-slug" className="flex-1 px-3 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none bg-transparent"
                      autoFocus autoComplete="username"
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-400 font-medium" role="alert">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {step === 2 ? 'Verifying...' : 'Checking...'}
                </span>
              ) : step === 2 ? 'Unlock Dashboard' : 'Continue'}
            </button>
          </form>

          {step === 1 && (
            <p className="text-center mt-6 text-xs text-zinc-400">
              Don't have a business yet?{' '}
              <Link to="/signup" className="text-white font-semibold hover:text-zinc-200 transition-colors">Sign up here</Link>
            </p>
          )}
        </div>
      </main>

      {/* Footer - White, matching landing page */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} BookNaija Technologies.</p>
        </div>
      </footer>
    </div>
  );
}