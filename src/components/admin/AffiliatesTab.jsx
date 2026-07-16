import { useState } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';
import ExportButton from './ExportButton';
import ReferralModal from './ReferralModal';

export default function AffiliatesTab({
  affiliates, loading, search, setSearch,
  page, setPage, totalPages,
  handleManualPayout, setManualPayoutAffiliate,
  manualPayoutAffiliate, manualPayoutAmount, setManualPayoutAmount,
  manualPayoutReason, setManualPayoutReason,
  actionLoading, exportCSV,
  // referral modal
  showReferralModal, setShowReferralModal,
  selectedAffiliate, setSelectedAffiliate,
  affiliateReferrals, fetchAffiliateReferrals,
  handleCommissionOverride,
}) {
  const handleViewReferrals = (aff) => {
    setSelectedAffiliate(aff);
    fetchAffiliateReferrals(aff.id);
    setShowReferralModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search affiliates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
        />
        <ExportButton onClick={() => exportCSV(affiliates, 'affiliates.csv')} />
      </div>

      {/* Manual Payout Form */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
        <h4 className="text-sm font-bold text-white mb-2">Manual Payout</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Affiliate ID (click a row to auto-fill)"
            value={manualPayoutAffiliate}
            onChange={(e) => setManualPayoutAffiliate(e.target.value)}
            className="flex-1 min-w-[150px] bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="number"
            placeholder="Amount (₦)"
            value={manualPayoutAmount}
            onChange={(e) => setManualPayoutAmount(e.target.value)}
            className="w-32 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={manualPayoutReason}
            onChange={(e) => setManualPayoutReason(e.target.value)}
            className="flex-1 min-w-[150px] bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleManualPayout}
            disabled={actionLoading['manualPayout']}
            className="px-4 py-2.5 bg-white text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {actionLoading['manualPayout'] ? '...' : 'Send Payout'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading...</div>
      ) : (
        <Table
          headers={['ID', 'Name', 'Email', 'Referrals', 'Pending Payouts', 'Subaccount', 'Actions']}
          rows={affiliates.map(aff => ({
            cells: [
              <button
                onClick={() => setManualPayoutAffiliate(aff.id)}
                className="font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors"
                title="Click to auto-fill manual payout"
              >
                {aff.id}
              </button>,
              aff.name,
              <span className="hidden sm:table-cell text-zinc-400">{aff.email}</span>,
              <span className="text-center">{aff.referral_count}</span>,
              <span className="text-center hidden md:table-cell">
                {aff.pending_payouts > 0 ? (
                  <span className="text-red-400 font-bold">{aff.pending_payouts}</span>
                ) : (
                  <span className="text-zinc-500">0</span>
                )}
              </span>,
              <span className="text-zinc-400 font-mono text-xs truncate max-w-[120px]">
                {aff.subaccount_code || 'N/A'}
              </span>,
              <div className="flex flex-wrap gap-1">
                <ActionButton
                  onClick={() => handleViewReferrals(aff)}
                  label="Referrals"
                  color="blue"
                />
                <ActionButton
                  onClick={() => handleCommissionOverride(aff.id)}
                  label="Commission"
                  color="yellow"
                />
              </div>,
            ],
          }))}
        />
      )}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <ReferralModal
        show={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        affiliate={selectedAffiliate}
        referrals={affiliateReferrals}
      />
    </div>
  );
}