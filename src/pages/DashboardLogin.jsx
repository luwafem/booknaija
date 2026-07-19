import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNoIndex } from '../hooks/useNoIndex';

export default function DashboardLogin() {
  const navigate = useNavigate();
  useNoIndex();

  // Login states
  const [slug, setSlug] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bizName, setBizName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewCode, setResetNewCode] = useState('');
  const [resetNewQ1, setResetNewQ1] = useState('');
  const [resetNewA1, setResetNewA1] = useState('');
  const [resetNewQ2, setResetNewQ2] = useState('');
  const [resetNewA2, setResetNewA2] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const inputBase = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200";

  // ─── LOGIN: Step 1 – Get security questions ───
  async function handleSlugSubmit(e) {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Please enter your business slug.');
      return;
    }
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) {
      setError('Invalid slug format.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/.netlify/functions/get-dashboard-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Business not found.');
      }

      setBizName(data.name);
      setTempToken(data.token);

      const qs = [];
      if (data.security_question_1) qs.push(data.security_question_1);
      if (data.security_question_2) qs.push(data.security_question_2);
      if (qs.length === 0) {
        setActiveQuestion(null);
        setStep(2);
        setLoading(false);
        return;
      }
      const randIdx = Math.floor(Math.random() * qs.length);
      setActiveQuestion({ q: qs[randIdx], index: randIdx });
      setQuestions(qs);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to find business.');
    } finally {
      setLoading(false);
    }
  }

  // ─── LOGIN: Step 2 – Verify security code + answer ───
  async function handleSecuritySubmit(e) {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Security code is required.');
      return;
    }
    if (activeQuestion && !answer.trim()) {
      setError('Please answer the security question.');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        securityCode: code.trim(),
        securityQuestion: activeQuestion ? activeQuestion.q : null,
        securityAnswer: answer.trim().toLowerCase(),
        token: tempToken,
      };

      const res = await fetch('/.netlify/functions/dashboard-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      // ✅ Set sessionStorage flag so the dashboard knows we're authenticated
      sessionStorage.setItem('biz_auth_' + data.slug, 'true');

      navigate(`/dashboard/${data.slug}`);
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  // ─── RESET: Send OTP ───
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your business email.');
      return;
    }
    setResetError('');
    setResetLoading(true);

    try {
      const res = await fetch('/.netlify/functions/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }
      setResetStep(2);
      setResetError('');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  // ─── RESET: Verify OTP and update security details ───
  async function handleResetSubmit(e) {
    e.preventDefault();
    setResetError('');
    if (!resetOtp.trim()) {
      setResetError('Please enter the OTP sent to your email.');
      return;
    }
    if (!resetNewCode || resetNewCode.length !== 4) {
      setResetError('Please enter a 4-digit security code.');
      return;
    }
    if (!resetNewQ1 || !resetNewA1.trim() || !resetNewQ2 || !resetNewA2.trim()) {
      setResetError('Please select and answer both security questions.');
      return;
    }
    setResetLoading(true);

    try {
      const res = await fetch('/.netlify/functions/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: resetOtp.trim(),
          newCode: resetNewCode,
          newQ1: resetNewQ1,
          newA1: resetNewA1.trim(),
          newQ2: resetNewQ2,
          newA2: resetNewA2.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset security details.');
      }
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setStep(1);
        setSlug('');
        setCode('');
        setAnswer('');
        setError('');
        setResetSuccess(false);
        setResetStep(1);
        setResetEmail('');
        setResetOtp('');
        setResetNewCode('');
        setResetNewQ1('');
        setResetNewA1('');
        setResetNewQ2('');
        setResetNewA2('');
      }, 2000);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-700 selection:text-white flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/fav-removebg.png" alt="Five9 Logo" className="h-9 w-auto object-contain" />
          </Link>
          <Link to="/signup" className="text-sm font-semibold text-white bg-zinc-900 px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {step === 2 ? (
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-white">Verify Access</h1>
              <p className="text-sm text-zinc-400 mt-1">Logging into <span className="font-semibold text-white">{bizName || 'your business'}</span></p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-white">Manage Your Business</h1>
              <p className="text-sm text-zinc-400 mt-1">Enter your business slug to access the dashboard.</p>
            </div>
          )}

          <form onSubmit={step === 2 ? handleSecuritySubmit : handleSlugSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            {step === 2 ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">4-Digit Security Code</label>
                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="••••"
                    className={inputBase + " font-mono tracking-widest text-center text-xl"}
                    maxLength={4}
                    inputMode="numeric"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>
                {activeQuestion && (
                  <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Security Question</label>
                    <p className="text-sm text-zinc-200 font-medium mb-2">{activeQuestion.q}</p>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Your answer"
                      className={inputBase}
                      autoComplete="off"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setTempToken(''); }}
                  className="w-full text-xs text-zinc-400 hover:text-white transition-colors py-2"
                >
                  ← Back to Slug
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Business Slug</label>
                  <div className="flex items-center border border-zinc-700 rounded-xl overflow-hidden focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500 transition-all bg-zinc-800">
                    <span className="px-3 text-sm text-zinc-500 bg-zinc-800 border-r border-zinc-700 select-none">five9.com.ng/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="your-business-slug"
                      className="flex-1 px-3 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none bg-transparent"
                      autoFocus
                      autoComplete="username"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ─── ERROR MESSAGE (GREY) ─── */}
            {error && (
              <div className="rounded-xl px-4 py-3 bg-zinc-800/80 border border-zinc-700">
                <p className="text-xs text-zinc-300 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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

          {/* ─── FORGOT LINK ─── */}
          {step === 2 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Forgot your security details?
              </button>
            </div>
          )}

          {step === 1 && (
            <p className="text-center mt-6 text-xs text-zinc-400">
              Don't have a business yet?{' '}
              <Link to="/signup" className="text-white font-semibold hover:text-zinc-200 transition-colors">Sign up here</Link>
            </p>
          )}
        </div>
      </main>

      {/* ─── RESET MODAL ─── */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {resetSuccess
                  ? '✅ Reset Successful'
                  : resetStep === 1
                  ? 'Reset Security Details'
                  : resetStep === 2
                  ? 'Verify OTP'
                  : 'Set New Security Details'}
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-zinc-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-6">
                <p className="text-zinc-300 mb-4">Your security details have been updated. You can now log in with your new code.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setStep(1);
                    setSlug('');
                    setCode('');
                    setAnswer('');
                    setError('');
                    setResetSuccess(false);
                    setResetStep(1);
                    setResetEmail('');
                    setResetOtp('');
                    setResetNewCode('');
                    setResetNewQ1('');
                    setResetNewA1('');
                    setResetNewQ2('');
                    setResetNewA2('');
                  }}
                  className="w-full bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                {resetStep === 1 ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={inputBase}
                        required
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">We'll send a 6‑digit OTP to this email.</p>
                    </div>
                    {/* ─── RESET ERROR (GREY) ─── */}
                    {resetError && (
                      <div className="rounded-xl px-4 py-3 bg-zinc-800/80 border border-zinc-700">
                        <p className="text-xs text-zinc-300">{resetError}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      {resetLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                ) : resetStep === 2 ? (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Enter 6‑Digit OTP
                      </label>
                      <input
                        type="text"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        placeholder="123456"
                        className={inputBase + " font-mono text-center text-xl"}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Check your email for the OTP.</p>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Set New Security Details</h4>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">New 4-Digit Code</label>
                        <input
                          type="password"
                          value={resetNewCode}
                          onChange={(e) => setResetNewCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          placeholder="••••"
                          className={inputBase + " font-mono tracking-widest text-center text-xl"}
                          maxLength={4}
                          inputMode="numeric"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Security Question 1</label>
                        <select
                          className={inputBase}
                          value={resetNewQ1}
                          onChange={(e) => setResetNewQ1(e.target.value)}
                          required
                        >
                          <option value="">Select a question...</option>
                          <option value="What is your pet's name?">What is your pet's name?</option>
                          <option value="What city were you born in?">What city were you born in?</option>
                          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                          <option value="What was the name of your first school?">What was the name of your first school?</option>
                        </select>
                        <input
                          type="text"
                          value={resetNewA1}
                          onChange={(e) => setResetNewA1(e.target.value)}
                          placeholder="Your answer"
                          className={inputBase + " mt-2"}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">Security Question 2</label>
                        <select
                          className={inputBase}
                          value={resetNewQ2}
                          onChange={(e) => setResetNewQ2(e.target.value)}
                          required
                        >
                          <option value="">Select a question...</option>
                          <option value="What is your favorite childhood movie?">What is your favorite childhood movie?</option>
                          <option value="What street did you grow up on?">What street did you grow up on?</option>
                          <option value="What is the name of your best friend?">What is the name of your best friend?</option>
                          <option value="What was your first car?">What was your first car?</option>
                        </select>
                        <input
                          type="text"
                          value={resetNewA2}
                          onChange={(e) => setResetNewA2(e.target.value)}
                          placeholder="Your answer"
                          className={inputBase + " mt-2"}
                          required
                        />
                      </div>
                    </div>

                    {/* ─── RESET ERROR (GREY) ─── */}
                    {resetError && (
                      <div className="rounded-xl px-4 py-3 bg-zinc-800/80 border border-zinc-700">
                        <p className="text-xs text-zinc-300">{resetError}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      {resetLoading ? 'Resetting...' : 'Reset Security Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="w-full text-xs text-zinc-400 hover:text-white transition-colors py-1"
                    >
                      ← Back to Email
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-zinc-200 py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Five9 Technologies.</p>
        </div>
      </footer>
    </div>
  );
}