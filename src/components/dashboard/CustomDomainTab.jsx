import { useState } from 'react';
import { getCsrfToken } from '../../lib/csrf';

export default function CustomDomainTab({ biz, accent, inp, lbl, card, onRefresh }) {
  const [domain, setDomain] = useState(biz.custom_domain || '');
  const [status, setStatus] = useState(biz.custom_domain_status || 'none');
  const [notes, setNotes] = useState(biz.custom_domain_notes || '');
  const [dnsRecords, setDnsRecords] = useState(biz.dns_records || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim() || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain.trim())) {
      setMessage('Please enter a valid domain (e.g., mybusiness.com)');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/.netlify/functions/business-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ slug: biz.slug, custom_domain: domain.trim(), action: 'request' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('pending');
        setMessage('Domain submitted for review. You will be notified once approved.');
        if (onRefresh) onRefresh();
      } else {
        setMessage(data.error || 'Failed to submit domain.');
      }
    } catch (err) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove custom domain? This will disconnect your domain.')) return;
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/business-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ slug: biz.slug, action: 'remove' }),
      });
      if (res.ok) {
        setStatus('none');
        setDomain('');
        setDnsRecords(null);
        setNotes('');
        setMessage('Domain removed.');
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to remove domain.');
      }
    } catch (err) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'pending':
        return <span className="text-yellow-400 font-bold">Pending Admin Review</span>;
      case 'approved':
        return <span className="text-blue-400 font-bold">Approved – Add DNS Records</span>;
      case 'rejected':
        return <span className="text-red-400 font-bold">Rejected</span>;
      case 'verified':
        return <span className="text-green-400 font-bold">✓ Active</span>;
      default:
        return <span className="text-zinc-400">Not set</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Custom Domain</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Use your own domain (e.g., mybusiness.com) instead of the Five9 subpath.
          You must own the domain and have access to its DNS settings.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-zinc-300">Status:</span>
          {renderStatus()}
        </div>

        {status === 'none' || status === 'rejected' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={lbl}>Your Domain</label>
              <input
                className={inp}
                placeholder="e.g., mybusiness.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                required
              />
            </div>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-900 font-bold py-2.5 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request Domain'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-400">Your domain:</p>
              <p className="text-sm font-bold text-white">{biz.custom_domain}</p>
            </div>

            {status === 'approved' && dnsRecords && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">DNS Records</p>
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all bg-black/30 p-3 rounded-lg">
                  {JSON.stringify(dnsRecords, null, 2)}
                </pre>
                <p className="text-[10px] text-zinc-500 mt-2">
                  Add these records to your domain registrar's DNS settings.
                </p>
              </div>
            )}

            {notes && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Admin Note</p>
                <p className="text-sm text-zinc-300">{notes}</p>
              </div>
            )}

            {status === 'pending' && (
              <p className="text-sm text-zinc-400">We'll notify you once the admin reviews your request.</p>
            )}

            {status !== 'verified' && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                {loading ? 'Removing...' : 'Remove Domain Request'}
              </button>
            )}

            {message && <p className="text-sm text-zinc-300">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}