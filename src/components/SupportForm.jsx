// src/components/SupportForm.jsx
import { useState } from 'react';
import { getCsrfToken } from '../lib/csrf';

export default function SupportForm({ userType, userId, userEmail, accent }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/submit-support-ticket', {
        method: 'POST',
        credentials: 'include', // 👈 CRITICAL FIX
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          userType,
          userId,
          email: userEmail,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-white/[0.12]"
          placeholder="Brief summary"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1.5">Message</label>
        <textarea
          required
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-500 focus:outline-none focus:border-white/[0.12] resize-none"
          placeholder="Describe your issue or feedback..."
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">Ticket submitted! We'll get back to you soon.</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-zinc-900 font-bold py-3 rounded-full text-[11px] tracking-[0.15em] uppercase hover:bg-zinc-100 transition-all disabled:opacity-50"
        style={{ backgroundColor: accent }}
      >
        {loading ? 'Submitting...' : 'Send Support Request'}
      </button>
    </form>
  );
}