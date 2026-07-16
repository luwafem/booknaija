// src/components/dashboard/SubscriptionTab.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function SubscriptionTab({
  biz,
  accent,
  inp,
  lbl,
  card,
  isExpired,
  isWarning,
  daysLeft,
  subLoading,
  subMsg,
  handlePaySubscription,
  subscriptionHistory = [],
  historyLoading = false,
  fetchSubscriptionHistory, // 👈 NEW prop
}) {
  const queryClient = useQueryClient(); // 👈 ADD
  const [showHistory, setShowHistory] = useState(false);

  // Use parent props for status – do NOT recompute here
  const subscriptionEndsAt = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : null;
  const hasSubscription = !!subscriptionEndsAt;
  const isActive = !isExpired && hasSubscription && subscriptionEndsAt > new Date();

  const formattedEndDate = subscriptionEndsAt
    ? subscriptionEndsAt.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not set';

  // Determine status for display – use parent values
  const status = isActive ? 'active' : isWarning ? 'warning' : 'expired';

  // Group history by month/year for display
  const groupedHistory = subscriptionHistory.reduce((acc, item) => {
    const date = new Date(item.processed_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const historyKeys = Object.keys(groupedHistory).sort().reverse();

  // ─── Manual refresh handler ───
  const handleRefresh = () => {
    // Invalidate the business cache so InfoTab and this tab get fresh data
    queryClient.invalidateQueries({ queryKey: ['business', biz.slug] });
    if (fetchSubscriptionHistory) {
      fetchSubscriptionHistory();
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── SUBSCRIPTION STATUS CARD ─── */}
      <div className={card}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Subscription Status</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="text-[10px] text-zinc-400 hover:text-white transition-colors p-1"
              title="Refresh status and history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status === 'active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : status === 'warning'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {status === 'active'
                ? 'Active'
                : status === 'warning'
                ? 'Expiring Soon'
                : 'Expired'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status icon and message */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : status === 'warning'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {status === 'active' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : status === 'warning' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {status === 'active'
                  ? `Your page is active and accepting bookings`
                  : status === 'warning'
                  ? `Your subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
                  : 'Your page is currently inactive'}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {subscriptionEndsAt
                  ? status === 'active'
                    ? `Valid until ${formattedEndDate}`
                    : status === 'warning'
                    ? `Expires on ${formattedEndDate}`
                    : `Expired on ${formattedEndDate}`
                  : 'No active subscription'}
              </p>
            </div>
          </div>

          {/* Subscription details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Plan</p>
              <p className="text-sm font-bold text-white mt-1">Monthly</p>
              <p className="text-[10px] text-zinc-500">₦2,500 / month</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Page Status</p>
              <p className={`text-sm font-bold mt-1 ${status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                {status === 'active' ? 'Live' : 'Hidden'}
              </p>
              <p className="text-[10px] text-zinc-500">
                {status === 'active' ? 'Visible to customers' : 'Not accepting bookings'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {status === 'expired' || status === 'warning' ? (
            <>
              {subMsg && (
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-xs text-zinc-300">{subMsg}</p>
                </div>
              )}
              <button
                type="button"
                onClick={handlePaySubscription}
                disabled={subLoading}
                className="w-full bg-white text-zinc-900 font-bold py-3.5 rounded-full hover:bg-zinc-100 transition-all duration-300 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 text-[11px] tracking-[0.15em] uppercase"
              >
                {subLoading
                  ? 'Processing...'
                  : status === 'expired'
                  ? 'Reactivate Page — ₦2,500'
                  : 'Renew Subscription — ₦2,500'}
              </button>
              {status === 'warning' && (
                <p className="text-[10px] text-zinc-500 text-center">
                  Your page will be hidden on {formattedEndDate} if not renewed.
                </p>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm('Extend your subscription by 30 days for ₦2,500?')) {
                  handlePaySubscription();
                }
              }}
              disabled={subLoading}
              className="w-full bg-white/[0.06] border border-white/[0.06] text-white font-bold py-3.5 rounded-full hover:bg-white/[0.10] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 text-[11px] tracking-[0.15em] uppercase"
            >
              {subLoading ? 'Processing...' : 'Extend Subscription (+30 days)'}
            </button>
          )}
        </div>
      </div>

      {/* ─── REFERRAL INFO ─── */}
      <div className={card}>
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Referral Rewards</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Referrals</p>
              <p className="text-lg font-bold text-white">{biz.referralCount || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Free Months Earned</p>
              <p className="text-lg font-bold text-white">{Math.floor((biz.referralCount || 0) / 3)}</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 text-center">
            {biz.referralCount && biz.referralCount % 3 === 0 && biz.referralCount > 0
              ? '🎉 You\'ve earned a free month!'
              : `${3 - ((biz.referralCount || 0) % 3)} more referral${
                  3 - ((biz.referralCount || 0) % 3) !== 1 ? 's' : ''
                } until your next free month`}
          </p>
        </div>
      </div>

      {/* ─── SUBSCRIPTION HISTORY ─── */}
      {historyLoading ? (
        <div className={card}>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          </div>
        </div>
      ) : subscriptionHistory.length > 0 ? (
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Payment History</h3>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-[10px] text-zinc-400 hover:text-white transition-colors p-1"
              title="Refresh history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-sm font-bold text-white tracking-tight">Payment History</h3>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                showHistory ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {historyKeys.map((key) => (
                <div key={key}>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">
                    {key.replace('-', ' ')}
                  </p>
                  <div className="space-y-2">
                    {groupedHistory[key].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                      >
                        <div>
                          <p className="text-xs font-medium text-white">
                            {item.note || 'Subscription payment'}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(item.processed_at).toLocaleDateString('en-NG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">
                            ₦{(item.amount / 100).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-500 capitalize">
                            {item.source || 'webhook'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Payment History</h3>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-[10px] text-zinc-400 hover:text-white transition-colors p-1"
              title="Refresh history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="text-center py-6">
            <p className="text-xs text-zinc-500">No payment history yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}