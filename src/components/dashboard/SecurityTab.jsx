// src/components/dashboard/SecurityTab.jsx
import { useState } from 'react';
import { getCsrfToken } from '../../lib/csrf'; // ✅ fixed import path

export default function SecurityTab({ accent, inp, lbl, card, slug }) {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  // Optional security questions update
  const [updateQuestions, setUpdateQuestions] = useState(false);
  const [q1, setQ1] = useState('');
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState('');
  const [a2, setA2] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!currentCode || !newCode) {
      setMessage({ type: 'error', text: 'Current and new security code are required.' });
      return;
    }
    if (!/^\d{4}$/.test(newCode)) {
      setMessage({ type: 'error', text: 'New security code must be exactly 4 digits.' });
      return;
    }
    if (newCode !== confirmCode) {
      setMessage({ type: 'error', text: 'New security codes do not match.' });
      return;
    }

    setLoading(true);

    const payload = {
      slug,
      currentCode,
      newCode,
    };

    if (updateQuestions) {
      if (!q1 || !a1 || !q2 || !a2) {
        setMessage({ type: 'error', text: 'Please fill in all security questions and answers.' });
        setLoading(false);
        return;
      }
      if (q1 === q2) {
        setMessage({ type: 'error', text: 'Security questions must be different.' });
        setLoading(false);
        return;
      }
      payload.securityQuestion1 = q1;
      payload.securityAnswer1 = a1;
      payload.securityQuestion2 = q2;
      payload.securityAnswer2 = a2;
    }

    try {
      const res = await fetch('/.netlify/functions/update-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Security details updated successfully.' });
        setCurrentCode('');
        setNewCode('');
        setConfirmCode('');
        if (updateQuestions) {
          setQ1('');
          setA1('');
          setQ2('');
          setA2('');
          setUpdateQuestions(false);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Change Security Code</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Current Security Code</label>
            <input
              className={inp}
              type="password"
              placeholder="••••"
              maxLength="4"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div>
            <label className={lbl}>New Security Code</label>
            <input
              className={inp}
              type="password"
              placeholder="••••"
              maxLength="4"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div>
            <label className={lbl}>Confirm New Code</label>
            <input
              className={inp}
              type="password"
              placeholder="••••"
              maxLength="4"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={updateQuestions}
                onChange={() => setUpdateQuestions(!updateQuestions)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-white focus:ring-zinc-500"
              />
              Also update security questions
            </label>
          </div>

          {updateQuestions && (
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className={lbl}>Security Question 1</label>
                <select
                  className={inp}
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  required
                >
                  <option value="">Select a question...</option>
                  <option value="What is your pet's name?">What is your pet's name?</option>
                  <option value="What city were you born in?">What city were you born in?</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What was the name of your first school?">What was the name of your first school?</option>
                </select>
                <input
                  className={inp + " mt-2"}
                  placeholder="Your answer"
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={lbl}>Security Question 2</label>
                <select
                  className={inp}
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  required
                >
                  <option value="">Select a question...</option>
                  <option value="What is your favorite childhood movie?">What is your favorite childhood movie?</option>
                  <option value="What street did you grow up on?">What street did you grow up on?</option>
                  <option value="What is the name of your best friend?">What is the name of your best friend?</option>
                  <option value="What was your first car?">What was your first car?</option>
                </select>
                <input
                  className={inp + " mt-2"}
                  placeholder="Your answer"
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {message.text && (
            <div className={`rounded-xl px-4 py-3 ${message.type === 'error' ? 'bg-red-900/40 border border-red-700 text-red-300' : 'bg-green-900/40 border border-green-700 text-green-300'}`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3 rounded-full text-[11px] tracking-[0.15em] uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: accent }}
          >
            {loading ? 'Updating...' : 'Update Security'}
          </button>
        </form>
      </div>
    </div>
  );
}