import { useState, useEffect } from 'react';

/**
 * DomainManager – allows business owners to add and verify custom domains.
 * Expects:
 * - biz: the business object (must contain slug)
 * - accent: brand color
 * - inp, card, lbl, sel, etc. (or we can accept them as props or use className overrides)
 * 
 * We'll keep the component self-contained with its own styling, but we can pass theme tokens.
 */
export default function DomainManager({ 
  biz, 
  accent = '#c8a97e', 
  inputClassName = '', 
  cardClassName = '',
  buttonClassName = '',
}) {
  const [domainInput, setDomainInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [domainStatus, setDomainStatus] = useState(null);
  const [currentDomain, setCurrentDomain] = useState(null);

  // Fetch current domain on mount (optional, but we'll assume biz might have a domains array)
  useEffect(() => {
    if (biz?.domains && biz.domains.length > 0) {
      setCurrentDomain(biz.domains[0].domain);
    }
  }, [biz]);

  const handleVerify = async () => {
    if (!domainInput.trim()) return;
    setVerifying(true);
    setDomainStatus(null);

    try {
      const res = await fetch('/.netlify/functions/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain: domainInput.trim(), 
          slug: biz.slug 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDomainStatus({ success: true, message: data.message || 'Domain verified successfully!' });
        setCurrentDomain(domainInput.trim());
        setDomainInput(''); // Clear input after success
      } else {
        setDomainStatus({ success: false, message: data.error || 'Verification failed.' });
      }
    } catch (err) {
      setDomainStatus({ success: false, message: err.message || 'Network error.' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={cardClassName}>
      <h3 className="text-sm font-bold text-white tracking-tight mb-4">Custom Domain</h3>
      
      <p className="text-xs text-zinc-400 mb-4">
        Point your domain to BookNaija and verify it to use it as your business URL. 
        You'll need to add a TXT record to your DNS settings.
      </p>

      {currentDomain && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-400">
            ✅ Active domain: <span className="font-mono">{currentDomain}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <input
          className={inputClassName}
          placeholder="mybusiness.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || !domainInput.trim()}
          className={buttonClassName}
        >
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {domainStatus && (
        <div 
          className={`mt-3 p-3 rounded-xl ${
            domainStatus.success 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <p className={`text-xs ${domainStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
            {domainStatus.message}
          </p>
        </div>
      )}

      <div className="mt-4 text-[11px] text-zinc-500 border-t border-white/[0.06] pt-4">
        <p className="font-semibold text-zinc-400">How to verify:</p>
        <ol className="list-decimal list-inside space-y-1 mt-1 text-zinc-500">
          <li>Go to your domain's DNS settings (e.g., your hosting provider).</li>
          <li>Add a new TXT record with the value: <code className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono text-zinc-300">booknaija-verify={biz.slug}</code></li>
          <li>Wait a few minutes for DNS propagation, then click "Verify".</li>
        </ol>
      </div>
    </div>
  );
}