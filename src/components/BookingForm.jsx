import { useState, useEffect } from 'react';
import { XIcon, CalendarIcon } from './Icons';

export default function BookingForm({ biz, selectedId, selectedProducts = [], onDeselect, onProductDeselect, reference }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [booking, setBooking] = useState(null);

  const accent = biz.accent || '#c8a97e';
  
  // Derive selections
  const svc = biz.services?.find((s) => s.id === selectedId);
  const selectedPrds = biz.products?.filter((p) => selectedProducts.includes(p.id)) || [];
  
  const isService = !!svc;
  const isProduct = selectedPrds.length > 0;
  const hasSelection = isService || isProduct;

  // Calculate dynamic totals for Paystack
  const totalAmount = isProduct 
    ? selectedPrds.reduce((sum, p) => sum + p.price, 0) 
    : svc?.price || 0;

  const itemNames = isProduct 
    ? selectedPrds.map(p => p.name).join(', ')
    : svc?.name || '';

  useEffect(() => {
    if (!reference) return;
    setLoading(true);
    fetch('/.netlify/functions/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: biz.slug, reference, calendarId: biz.calendarId }),
    })
      .then(async (r) => {
        const text = await r.text();
        try { return JSON.parse(text); }
        catch { return { error: `Server error: ${text.substring(0, 100)}` }; }
      })
      .then((d) => {
        if (d.success) { setBooking(d.booking); setOk(true); }
        else { setErr(d.error || 'Booking failed'); }
      })
      .catch((e) => setErr('Network error: ' + e.message))
      .finally(() => setLoading(false));
  }, [reference, biz.slug, biz.calendarId]);

  async function pay(e) {
    e.preventDefault();
    if (!hasSelection) return;
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/.netlify/functions/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: biz.slug, 
          serviceId: isProduct ? selectedProducts.join(',') : selectedId, 
          serviceName: itemNames, 
          amount: totalAmount,
          date: isProduct ? 'N/A' : date, 
          time: isProduct ? 'N/A' : time,
          type: isProduct ? 'product' : 'service',
          address: isProduct ? address : 'N/A',
          name, email, phone, calendarId: biz.calendarId,
        }),
      });
      const d = await r.json();
      if (d.authorization_url) window.location.href = d.authorization_url;
      else setErr(d.error || 'Payment failed');
    } catch { setErr('Network error'); }
    setLoading(false);
  }

  if (ok && booking) {
    const isProductOk = booking.type === 'product';
    let calUrl = '#';
    if (!isProductOk && booking.date && booking.time) {
      const [h, min] = booking.time.split(':').map(Number);
      const end = `${String(Math.floor((h * 60 + min + 60) / 60)).padStart(2, '0')}:${String((h * 60 + min + 60) % 60).padStart(2, '0')}`;
      const gd = booking.date.replace(/-/g, '');
      calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceName)}+with+${encodeURIComponent(biz.name)}&dates=${gd}T${booking.time.replace(':', '')}00/${gd}T${end.replace(':', '')}00&ctz=Africa/Lagos`;
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold border"
            style={{ background: `${accent}15`, color: accent, borderColor: `${accent}30`, boxShadow: `0 0 40px -10px ${accent}40` }}>
            ✓
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{isProductOk ? 'Order Confirmed!' : 'Booking Confirmed!'}</h2>
          <p className="text-stone-400 mt-3 text-sm leading-relaxed">{booking.serviceName}</p>
          <p className="text-stone-600 mt-1.5 text-sm">Check your email for your Paystack receipt.</p>
          {!isProductOk && (
            <a href={calUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
              <CalendarIcon /> Add to Google Calendar
            </a>
          )}
          <a href={`/${biz.slug}`} className="block mt-6 text-xs text-stone-600 hover:text-stone-400 transition-colors">← Back to page</a>
        </div>
      </div>
    );
  }

  if (reference && loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="flex items-center gap-3 text-stone-400 text-sm">
        <div className="w-4 h-4 border-2 border-stone-600 border-t-stone-200 rounded-full animate-spin" />
        Verifying payment…
      </div>
    </div>
  );

  if (reference && err) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4 flex items-center justify-center text-red-400 text-2xl">!</div>
        <p className="text-red-400 text-sm font-medium">{err}</p>
        <a href={`/${biz.slug}`} className="inline-block mt-6 text-sm font-medium" style={{ color: accent }}>← Back to page</a>
      </div>
    </div>
  );

  if (!hasSelection) return (
    <div className="text-center py-12 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
      <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 mx-auto mb-3 flex items-center justify-center text-stone-600">
         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.567-2.226m-2.51-2.225l.567 2.226m-2.51-2.225l-2.51 2.225a.75.75 0 01-.554-.759l-1.285-5.137a3 3 0 00-1.794-2.187L2.77 5.313a.75.75 0 01.85-.748l7.4 2.246a3 3 0 011.75 2.187l1.78 7.127a.75.75 0 01-.851.748L12 14.5l-4.995 1.721a.75.75 0 01-.463-1.549z" />
         </svg>
      </div>
      <p className="text-stone-500 text-sm">Select a service or product above to continue</p>
    </div>
  );

  const inputBase = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-700 transition-all duration-200 focus:outline-none focus:border-white/30 focus:bg-black/60';
  const labelStyle = "block text-[11px] text-stone-500 uppercase tracking-[0.15em] mb-2 px-1 font-semibold";

  return (
    <form onSubmit={pay} className="space-y-5 mt-2">
      
      {/* ── SINGLE SERVICE SUMMARY ── */}
      {isService && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
          style={{ borderColor: `${accent}20` }}>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-stone-200">{svc.name}</p>
            <p className="text-xs text-stone-500 mt-1">{svc.duration}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 ml-3">
            <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>₦{svc.price.toLocaleString()}</p>
            <button type="button" onClick={onDeselect} className="text-stone-500 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── MULTIPLE PRODUCTS SUMMARY (CART VIEW) ── */}
      {isProduct && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-3" style={{ borderColor: `${accent}20` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Your Order ({selectedPrds.length})</h3>
            <button 
              type="button" 
              onClick={() => onProductDeselect('all')} 
              className="text-[10px] text-stone-600 hover:text-red-400 transition-colors font-semibold uppercase tracking-wider"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-3">
            {selectedPrds.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="min-w-0 flex items-center gap-3">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/5" />
                  )}
                  <p className="text-sm text-stone-300 truncate">{p.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>₦{p.price.toLocaleString()}</p>
                  <button type="button" onClick={() => onProductDeselect(p.id)} className="text-stone-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Total */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-sm font-semibold text-stone-300">Total</span>
            <span className="text-base font-bold tabular-nums" style={{ color: accent }}>
              ₦{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{err}</p>
        </div>
      )}

      {/* ── DATE / TIME (Services Only) ── */}
      {!isProduct && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelStyle}>Date</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} 
              className={inputBase} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className={labelStyle}>Time</label>
            <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} 
              className={inputBase} style={{ colorScheme: 'dark' }} />
          </div>
        </div>
      )}

      {/* ── DELIVERY ADDRESS (Products Only) ── */}
      {isProduct && (
        <div>
          <label className={labelStyle}>Delivery Address</label>
          <textarea required placeholder="Enter your delivery address" value={address} onChange={(e) => setAddress(e.target.value)} 
            className={`${inputBase} h-24 resize-none`} />
        </div>
      )}

      {/* ── CONTACT DETAILS ── */}
      <div className="space-y-4">
        <div>
          <label className={labelStyle}>Your Name</label>
          <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputBase} />
        </div>
        <div>
          <label className={labelStyle}>Email</label>
          <input required type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputBase} />
        </div>
        <div>
          <label className={labelStyle}>Phone</label>
          <input required placeholder="+234..." value={phone} onChange={(e) => setPhone(e.target.value)} className={inputBase} />
        </div>
      </div>

      {/* ── SUBMIT BUTTON ── */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-[0.98] mt-2 shadow-lg"
        style={{ 
          background: accent, 
          color: '#0a0a0a'
        }}>
        {loading ? 'Processing…' : isProduct ? `Pay ₦${totalAmount.toLocaleString()}` : 'Pay & Book'}
      </button>
    </form>
  );
}