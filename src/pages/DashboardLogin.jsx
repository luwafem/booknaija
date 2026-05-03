import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoIndex } from '../hooks/useNoIndex';

export default function DashboardLogin() {
  var navigate = useNavigate();
  
  // Prevent search engines from indexing this protected page
  useNoIndex();
  
  var slugArr = useState('');
  var slug = slugArr[0];
  var setSlug = slugArr[1];
  
  var stepArr = useState(1); // 1: slug, 2: security
  var step = stepArr[0];
  var setStep = stepArr[1];
  
  var errorArr = useState('');
  var error = errorArr[0];
  var setError = errorArr[1];

  var loadingArr = useState(false);
  var loading = loadingArr[0];
  var setLoading = loadingArr[1];

  var bizDataArr = useState(null);
  var bizData = bizDataArr[0];
  var setBizData = bizDataArr[1];

  var codeArr = useState('');
  var code = codeArr[0];
  var setCode = codeArr[1];

  var answerArr = useState('');
  var answer = answerArr[0];
  var setAnswer = answerArr[1];

  var activeQuestionArr = useState(null);
  var activeQuestion = activeQuestionArr[0];
  var setActiveQuestion = activeQuestionArr[1];

  var inputBase = "w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-purple-600 transition-all";

  async function handleSlugSubmit(e) {
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
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) throw new Error("Configuration missing");

      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?slug=eq.${clean}&select=name,slug,security_code,security_question_1,security_question_2,security_answer_1,security_answer_2`, {
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (!res.ok || data.length === 0) {
        throw new Error('Business not found.');
      }

      const biz = data[0];

      // Edge case: Old user who hasn't set up security yet
      if (!biz.security_code) {
         sessionStorage.setItem('biz_auth_' + clean, 'setup_required');
         navigate('/dashboard/' + clean);
         return;
      }

      setBizData(biz);
      
      // Pick a random security question to ask
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
    } finally {
      setLoading(false);
    }
  }

  function handleSecuritySubmit(e) {
    e.preventDefault();
    setError('');

    if (!bizData) return;

    var cleanCode = code.trim();
    var cleanAnswer = answer.trim().toLowerCase();

    if (cleanCode !== bizData.security_code) {
      setError('Invalid security code.');
      return;
    }

    if (activeQuestion && cleanAnswer !== activeQuestion.a) {
      setError('Incorrect answer to security question.');
      return;
    }

    // Success!
    sessionStorage.setItem('biz_auth_' + slug, 'true');
    navigate('/dashboard/' + slug);
  }

  // ─── STEP 2: SECURITY CHECK UI ───
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <a href="/dashboard" aria-label="Back to dashboard login">
              <img src="/fav-removebg.png" alt="BookNaija" className="h-16 w-auto mx-auto object-contain mb-6" />
            </a>
            <h1 className="text-xl font-bold text-zinc-900">Verify Access</h1>
            <p className="text-sm text-zinc-500 mt-1">Logging into <span className="font-semibold text-zinc-800">{bizData.name}</span></p>
          </div>

          <form onSubmit={handleSecuritySubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-5">
            <div>
              <label htmlFor="security-code" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">4-Digit Security Code</label>
              <input
                id="security-code"
                type="password"
                value={code}
                onChange={function(e) { setCode(e.target.value.replace(/\D/g, '').substring(0, 4)); }}
                placeholder="••••"
                className={inputBase + " font-mono tracking-widest text-center text-xl"}
                maxLength={4}
                inputMode="numeric"
                autoFocus
                autoComplete="one-time-code"
              />
            </div>

            {activeQuestion && (
              <div className="border-t border-zinc-100 pt-5">
                <label htmlFor="security-answer" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Security Question</label>
                <p className="text-sm text-zinc-800 font-medium mb-2">{activeQuestion.q}</p>
                <input
                  id="security-answer"
                  type="text"
                  value={answer}
                  onChange={function(e) { setAnswer(e.target.value); }}
                  placeholder="Your answer"
                  className={inputBase}
                  autoComplete="off"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
                <p className="text-xs text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <button type="button" onClick={function() { setStep(1); setBizData(null); setError(''); }} className="w-full text-xs text-zinc-500 hover:text-zinc-700 font-medium transition-colors">
              &larr; Back to Slug
            </button>

            <button 
              type="submit" 
              className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── STEP 1: SLUG ENTRY UI ───
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" aria-label="Go to homepage">
            <img src="/fav-removebg.png" alt="BookNaija" className="h-16 w-auto mx-auto object-contain mb-6" />
          </a>
          <h1 className="text-xl font-bold text-zinc-900">Manage Your Business</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your business slug to access the dashboard.</p>
        </div>

        <form onSubmit={handleSlugSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
          <div>
            <label htmlFor="biz-slug" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Business Slug</label>
            <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <span className="px-3 text-sm text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none" aria-hidden="true">booknaija.com/</span>
              <input
                id="biz-slug"
                type="text"
                value={slug}
                onChange={function(e) { setSlug(e.target.value); }}
                placeholder="your-business-slug"
                className="flex-1 px-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all active:scale-[0.98] disabled:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </span>
            ) : 'Continue'}
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