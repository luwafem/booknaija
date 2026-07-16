export default function ReferralModal({ show, onClose, affiliate, referrals }) {
  if (!show || !affiliate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Referrals by {affiliate.name}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        {referrals.length === 0 ? (
          <p className="text-zinc-400">No referrals found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="text-left py-2 px-2">Business</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Created</th>
                <th className="text-left py-2 px-2">Commission Month</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(ref => (
                <tr key={ref.slug} className="border-b border-zinc-800">
                  <td className="py-2 px-2 text-white">{ref.name}</td>
                  <td className="py-2 px-2 hidden sm:table-cell text-zinc-400">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-2 text-zinc-300">{ref.affiliate_commission_month || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}