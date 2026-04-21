import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import businesses from '../data/businesses';

export default function Booking() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const ref = params.get('reference') || params.get('trxref');
  const biz = businesses[slug];

  const [sid, setSid] = useState('');
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

  useEffect(() => {
    if (!ref) return;
    setLoading(true);
    fetch('/.netlify/functions/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, reference: ref, calendarId: biz.calendarId }),
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
  }, [ref, slug, biz?.calendarId]);

  async function pay(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    
    const svc = biz.services?.find((s) => s.id === sid);
    const prd = biz.products?.find((p) => p.id === sid);
    const item = svc || prd;
    const isProduct = !!prd;

    if (!item) { setErr('Please select an item'); setLoading(false); return; }

    try {
      const r = await fetch('/.netlify/functions/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug, serviceId: sid, serviceName: item.name, amount: item.price, 
          date: isProduct ? 'N/A' : date, 
          time: isProduct ? 'N/A' : time, 
          type: isProduct ? 'product' : 'service',
          address: isProduct ? address : 'N/A',
          name, email, phone, calendarId: biz.calendarId 
        }),
      });
      const d = await r.json();
      if (d.authorization_url) window.location.href = d.authorization_url;
      else setErr(d.error || 'Payment failed');
    } catch { setErr('Network error'); }
    setLoading(false);
  }

  // If business doesn't exist OR is turned off
  if (!biz || !biz.active) return <div className="p-8 text-center text-stone-500">This page is currently unavailable.</div>;

  const svc = biz.services?.find((s) => s.id === sid);
  const prd = biz.products?.find((p) => p.id === sid);
  const item = svc || prd;
  const isProduct = !!prd;
  const showServices = biz.servicesEnabled && biz.services?.length > 0;
  const showProducts = biz.productsEnabled && biz.products?.length > 0;

  if (ok && booking) {
    const isProductOk = booking.type === 'product';
    let calUrl = '#';
    
    if (!isProductOk && booking.date && booking.time) {
      const [h, min] = booking.time.split(':').map(Number);
      const endMinCalc = h * 60 + min + 60; 
      const calcEndTime = `${String(Math.floor(endMinCalc / 60)).padStart(2, '0')}:${String(endMinCalc % 60).padStart(2, '0')}`;
      const gDate = booking.date.replace(/-/g, '');
      const gTime = booking.time.replace(':', '') + '00';
      const gEndFinal = calcEndTime.replace(':', '') + '00';
      calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceName)}+with+${encodeURIComponent(biz.name)}&dates=${gDate}T${gTime}/${gDate}T${gEndFinal}&ctz=Africa/Lagos`;
    }

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-xl font-bold">{isProductOk ? 'Order Confirmed!' : 'Booking Confirmed!'}</h2>
          <p className="text-stone-500 mt-2">Check your email for your Paystack receipt.</p>
          {!isProductOk && (
            <a href={calUrl} target="_blank" rel="noreferrer"
              className="inline-block mt-6 border border-purple-700 text-purple-700 px-4 py-2 rounded text-sm font-medium">
              + Add to your Google Calendar
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">{biz.name}</h1>
      <p className="text-stone-500 text-sm">{biz.tagline}</p>
      
      {loading && <p className="mt-4 text-sm text-purple-700">Processing…</p>}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      
      {!ref && (
        <form onSubmit={pay} className="mt-6 space-y-6">
          
          {/* SERVICES DROPDOWN */}
          {showServices && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {showProducts ? 'Book a Service' : 'Select a Service'}
              </label>
              <select value={isProduct ? '' : sid} onChange={(e) => setSid(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm bg-white">
                <option value="">Choose a service</option>
                {biz.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — ₦{s.price.toLocaleString()} ({s.duration})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PRODUCTS GRID */}
          {showProducts && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {showServices ? 'Or Buy a Product' : 'Select a Product'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {biz.products.map((p) => (
                  <button type="button" key={p.id} onClick={() => setSid(p.id)}
                    className={`border rounded p-3 cursor-pointer text-center ${sid === p.id ? 'border-purple-700 bg-purple-50 ring-2 ring-purple-700' : 'border-stone-300 bg-white'}`}>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-stone-500 mt-1">₦{p.price.toLocaleString()}</p>
                    {sid === p.id && <p className="text-xs text-purple-700 font-bold mt-2">✓ Selected</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DATE/TIME (Only for Services) */}
          {!isProduct && sid && showServices && (
            <div className="space-y-4">
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
              <input required type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
            </div>
          )}

          {/* DELIVERY ADDRESS (Only for Products) */}
          {isProduct && (
            <textarea required placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm h-20 resize-none" />
          )}

          {/* CONTACT DETAILS */}
          <div className="space-y-4">
            <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
            <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
            <input required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
          </div>

          {item && <p className="text-sm text-stone-600">Total: <b>₦{item.price.toLocaleString()}</b></p>}
          
          <button type="submit" disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded text-sm font-medium disabled:opacity-50">
            {isProduct ? 'Pay Now' : 'Pay & Book'}
          </button>
        </form>
      )}
      
      <p className="mt-6 text-xs text-stone-400 text-center">
        Payments secured by Paystack. Funds go directly to {biz.name}.
      </p>
    </div>
  );
}