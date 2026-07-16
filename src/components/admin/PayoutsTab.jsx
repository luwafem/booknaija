import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';

export default function PayoutsTab({ failedPayouts, loading, page, setPage, totalPages, handleRetryPayout, actionLoading }) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading...</div>
      ) : failedPayouts.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 border border-zinc-800 rounded-xl">No failed payouts. 🎉</div>
      ) : (
        <Table
          headers={['Affiliate', 'Business', 'Amount', 'Reason', 'Action']}
          rows={failedPayouts.map(p => ({
            cells: [
              <span className="text-white font-medium">{p.affiliate_id}</span>,
              <span className="hidden sm:table-cell text-zinc-400">{p.business_slug}</span>,
              <span className="text-white font-bold">₦{p.amount.toLocaleString()}</span>,
              <span className="hidden lg:table-cell text-zinc-400 text-xs truncate max-w-[200px]">{p.reason}</span>,
              <ActionButton
                onClick={() => handleRetryPayout(p.id)}
                label="Retry"
                color="yellow"
                disabled={actionLoading['payout-' + p.id]}
              />,
            ],
          }))}
        />
      )}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}