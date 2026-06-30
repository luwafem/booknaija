// src/components/dashboard/OfflinePaymentsTab.jsx
export default function OfflinePaymentsTab({
  offlineBookings,
  offlineLoading,
  handleVerifyOfflinePayment,
  accent,
  card,
}) {
  if (offlineLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = offlineBookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">Bank Transfer Bookings</h3>
        {pendingCount > 0 && (
          <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.15em]">
            {pendingCount} Pending
          </span>
        )}
      </div>

      {offlineBookings.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl bg-white/[0.02]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-15 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-zinc-500 text-sm">No bank transfer bookings found.</p>
        </div>
      )}

      <div className="space-y-4">
        {offlineBookings.map((b) => {
          const isPending = b.status === 'pending';
          const isVerified = b.status === 'verified';
          return (
            <div key={b.id} className={card + (isPending ? '' : ' opacity-50')}>
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">{b.customer_name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.15em] ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-400'
                          : isVerified
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/[0.06] text-zinc-500'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mb-1">{b.order_summary}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {b.customer_phone}
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: accent }}>
                      <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ₦{b.amount.toLocaleString()}
                    </span>
                  </div>
                  {b.customer_address && (
                    <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-sm flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {b.customer_address}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 sm:w-auto w-full">
                  {b.proof_image_url && (
                    <a
                      href={b.proof_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium flex items-center gap-1.5 transition-colors duration-300 hover:opacity-70"
                      style={{ color: accent }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Proof
                    </a>
                  )}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleVerifyOfflinePayment(b.id)}
                      className="w-full sm:w-auto px-5 py-2.5 text-white text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ backgroundColor: accent }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Verify Payment
                    </button>
                  )}
                  {isVerified && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}