import { useState, useEffect } from 'react';
import { XIcon, CalendarIcon } from './Icons';

export default function BookingForm({ biz, selectedId, selectedProducts = [], onDeselect, onProductDeselect, reference, productVariants = {} }) {
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

  // Helper to get size/color for a specific product ID
  const getProductVariant = (id) => productVariants[id] || {};

  // Calculate dynamic totals for Paystack
  const totalAmount = isProduct 
    ? selectedPrds.reduce((sum, p) => sum + p.price, 0) 
    : svc?.price || 0;

  // Updated itemNames to include Size and Color context
  const itemNames = isProduct 
    ? selectedPrds.map(p => {
        const v = getProductVariant(p.id);
        const parts = [p.name];
        if (v.size) parts.push(`Size: ${v.size}`);
        if (v.color) parts.push(`Color: ${v.color}`);
        return parts.join(', ');
      }).join('; ')
    : svc?.name || '';

  useEffect(() => {
    if (!reference) return;
    
    console.log('🔄 Verifying payment, reference:', reference);
    setLoading(true);
    
    fetch('/.netlify/functions/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: biz.slug, reference, calendarId: biz.calendarId }),
    })
    .then(async (r) => {
      const text = await r.text();
      console.log('📡 Raw response:', r.status, text);
      try { return JSON.parse(text); }
      catch { return { error: `Server error: ${text.substring(0, 200)}` }; }
    })
    .then((d) => {
      console.log('📦 Parsed response:', d);
      if (d.success) { 
        setBooking(d.booking); 
        setOk(true); 
      } else { 
        setErr(d.error || 'Booking failed'); 
      }
    })
    .catch((e) => {
      console.error('❌ Network error:', e);
      setErr('Network error: ' + e.message);
    })
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
      if (d.authorization_url) {
        // ✅ Persist payment context so it survives the Paystack redirect
        try {
          localStorage.setItem('payCtx', JSON.stringify({
            amount: totalAmount,
            type: isProduct ? 'product' : 'service',
            serviceName: itemNames,
            date: isProduct ? 'N/A' : date,
            time: isProduct ? 'N/A' : time,
            address: isProduct ? address : 'N/A',
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            products: isProduct ? selectedPrds.map(p => {
              const v = getProductVariant(p.id);
              return { name: p.name, price: p.price, size: v.size || null, color: v.color || null };
            }) : [],
          }));
        } catch {}
        window.location.href = d.authorization_url;
      }
      else setErr(d.error || 'Payment failed');
    } catch { setErr('Network error'); }
    setLoading(false);
  }

  // ── SUCCESS SCREEN ──
  if (ok && booking) {
    // ✅ Retrieve payment context stored before Paystack redirect
    const ctx = (() => {
      try { return JSON.parse(localStorage.getItem('payCtx') || '{}'); } catch { return {}; }
    })();

    const isProductOk = booking.type === 'product' || ctx.type === 'product';
    const paymentAmount = Number(booking.amount) || ctx.amount || 0;

    let calUrl = '#';
    if (!isProductOk && booking.date && booking.time) {
      const [h, min] = booking.time.split(':').map(Number);
      const end = `${String(Math.floor((h * 60 + min + 60) / 60)).padStart(2, '0')}:${String((h * 60 + min + 60) % 60).padStart(2, '0')}`;
      const gd = booking.date.replace(/-/g, '');
      calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceName)}+with+${encodeURIComponent(biz.name)}&dates=${gd}T${booking.time.replace(':', '')}00/${gd}T${end.replace(':', '')}00&ctz=Africa/Lagos`;
    }

    // ✅ CONSTRUCT DETAILED WHATSAPP MESSAGE
    let waMessage = `Hi ${biz.name}! 👋\n\nI just made a ${isProductOk ? 'purchase' : 'booking'} on your page.\n\n`;
    
    // Customer Details
    waMessage += `*Customer Details:*\n`;
    waMessage += `Name: ${booking.name || ctx.customerName || name}\n`;
    waMessage += `Email: ${booking.email || ctx.customerEmail || email}\n`;
    waMessage += `Phone: ${booking.phone || ctx.customerPhone || phone}\n\n`;

    // Order/Booking Details
    if (isProductOk) {
      waMessage += `*Order Details:*\n`;
      
      // ✅ Use stored product details (includes price per item)
      const storedProducts = ctx.products || [];
      if (storedProducts.length > 0) {
        storedProducts.forEach((p) => {
          let itemLine = `• ${p.name}`;
          if (p.size) itemLine += ` | Size: ${p.size}`;
          if (p.color) itemLine += ` | Color: ${p.color}`;
          itemLine += ` - ₦${p.price.toLocaleString()}`;
          waMessage += `${itemLine}\n`;
        });
      } else {
        // Fallback: parse from booking.serviceName (no individual prices available)
        const orderItems = booking.serviceName || '';
        if (orderItems.includes(';')) {
          orderItems.split(';').forEach(item => {
            waMessage += `• ${item.trim()}\n`;
          });
        } else if (orderItems) {
          waMessage += `• ${orderItems}\n`;
        }
      }
      waMessage += `\n*Total:* ₦${paymentAmount.toLocaleString()}\n`;
      waMessage += `*Delivery Address:* ${booking.address || ctx.address || address}\n`;
    } else {
      waMessage += `*Booking Details:*\n`;
      waMessage += `Service: ${booking.serviceName || ctx.serviceName || svc?.name || ''}\n`;
      waMessage += `Date: ${booking.date || ctx.date || date}\n`;
      waMessage += `Time: ${booking.time || ctx.time || time}\n`;
      waMessage += `Price: ₦${paymentAmount.toLocaleString()}\n`;
    }

    if (reference) {
      waMessage += `\n*Ref:* ${reference}\n`;
    }
    
    waMessage += `\nLooking forward to hearing from you!`;

    // Generate the WhatsApp deep link
    const waLink = `https://wa.me/${biz.whatsapp}?text=${encodeURIComponent(waMessage)}`;

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
          
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* Google Calendar Button (Services Only) */}
            {!isProductOk && (
              <a href={calUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                <CalendarIcon /> Add to Google Calendar
              </a>
            )}

            {/* ✅ WHATSAPP FOLLOW-UP BUTTON */}
            <a href={waLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-sm font-bold transition-all bg-[#25D366] text-white hover:bg-[#1ebe57] active:scale-[0.98] shadow-lg shadow-[#25D366]/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Confirm on WhatsApp
            </a>
          </div>

          <a href={`/${biz.slug}`} className="block mt-8 text-xs text-stone-600 hover:text-stone-400 transition-colors">← Back to page</a>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.567-2.226m-2.51-2.225l.567 2.226m-2.51-2.225l2.51 2.225a.75.75 0 01-.554-.759l-1.285-5.137a3 3 0 00-1.794-2.187L2.77 5.313a.75.75 0 01.85-.748l7.4 2.246a3 3 0 011.75 2.187l1.78 7.127a.75.75 0 01-.851.748L12 14.5l-4.995 1.721a.75.75 0 01-.463-1.549z" />
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
            {selectedPrds.map((p) => {
              const variant = getProductVariant(p.id);
              return (
                <div key={p.id} className="flex items-start justify-between">
                  <div className="min-w-0 flex items-center gap-3">
                    {p.image && (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/5" />
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm text-stone-300">{p.name}</p>
                      
                      {/* Size & Color Display */}
                      {(variant.size || variant.color) && (
                        <div className="flex gap-2 text-[10px] text-stone-500 mt-0.5">
                          {variant.size && <span className="border border-white/10 px-1.5 rounded bg-white/5">Size: {variant.size}</span>}
                          {variant.color && (
                            <span className="flex items-center gap-1.5 border border-white/10 px-1.5 rounded bg-white/5">
                              <span 
                                className="w-3 h-3 rounded-full border border-stone-600/30"
                                style={{ backgroundColor: variant.color }} 
                              />
                              {variant.color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                    <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>₦{p.price.toLocaleString()}</p>
                    <button type="button" onClick={() => onProductDeselect(p.id)} className="text-stone-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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