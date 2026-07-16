import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';
import ExportButton from './ExportButton';

export default function TransactionsTab({ transactions, loading, page, setPage, totalPages, handleRefund, exportCSV }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-white">All Transactions</h3>
        <ExportButton onClick={() => exportCSV(transactions, 'transactions.csv')} />
      </div>
      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading...</div>
      ) : (
        <Table
          headers={['Reference', 'Source', 'Amount', 'Note', 'Date', 'Actions']}
          rows={transactions.map(tx => ({
            cells: [
              <span className="font-mono text-xs text-white">{tx.reference}</span>,
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tx.source === 'manual' ? 'bg-yellow-500/20 text-yellow-400' :
                tx.source === 'webhook' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-500/20 text-zinc-400'
              }`}>
                {tx.source || 'webhook'}
              </span>,
              <span className="text-white font-bold">₦{(tx.amount / 100).toLocaleString()}</span>,
              <span className="hidden md:table-cell text-zinc-400 text-xs truncate max-w-[150px]">{tx.note || '-'}</span>,
              <span className="text-zinc-400 text-xs whitespace-nowrap">
                {new Date(tx.processed_at).toLocaleString()}
              </span>,
              <ActionButton onClick={() => handleRefund(tx.reference)} label="Refund" color="red" />,
            ],
          }))}
        />
      )}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}