import { useState } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';
import ExportButton from './ExportButton';

export default function BusinessesTab({
  businesses, loading, search, setSearch,
  businessFilter, setBusinessFilter,
  businessTypeFilter, setBusinessTypeFilter,
  subscriptionFilter, setSubscriptionFilter,
  page, setPage, totalPages,
  selectedSlugs, setSelectedSlugs,
  handleBusinessAction, handleBulkAction,
  handleEditBusiness,
  actionLoading, exportCSV,
}) {
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(businesses.map(b => b.slug));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (slug) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Lash Artist', label: 'Lash Artist' },
    { value: 'Hair Stylist', label: 'Hair Stylist' },
    { value: 'Makeup Artist', label: 'Makeup Artist' },
    { value: 'Nail Technician', label: 'Nail Technician' },
    { value: 'Skin Care', label: 'Skin Care' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Auto', label: 'Auto' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Shortlet', label: 'Shortlet' },
    { value: 'Cleaner', label: 'Cleaner' },
    { value: 'Tutor', label: 'Tutor' },
    { value: 'Other', label: 'Other' },
  ];

  const subFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active (Paid)' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
        />
        <Select value={businessFilter} onChange={setBusinessFilter} options={filterOptions} />
        <Select value={businessTypeFilter} onChange={setBusinessTypeFilter} options={typeOptions} />
        <Select value={subscriptionFilter} onChange={setSubscriptionFilter} options={subFilterOptions} />
        <ExportButton onClick={() => exportCSV(businesses, 'businesses.csv')} />
      </div>

      {/* Bulk Actions */}
      {selectedSlugs.length > 0 && (
        <div className="flex gap-2 items-center bg-zinc-800/50 p-2 rounded-xl">
          <span className="text-sm text-zinc-300">{selectedSlugs.length} selected</span>
          <ActionButton onClick={() => handleBulkAction('activate')} label="Activate" color="green" />
          <ActionButton onClick={() => handleBulkAction('deactivate')} label="Deactivate" color="red" />
          <ActionButton onClick={() => handleBulkAction('extend')} label="Extend 30 Days" color="blue" />
          <button onClick={() => setSelectedSlugs([])} className="text-xs text-zinc-400 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading...</div>
      ) : (
        <Table
          headers={['', 'Business', 'Slug', 'Status', 'Expires', 'Actions']}
          rows={businesses.map(biz => ({
            cells: [
              <input
                type="checkbox"
                checked={selectedSlugs.includes(biz.slug)}
                onChange={() => toggleSelect(biz.slug)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600"
              />,
              <a href={`/${biz.slug}`} target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">
                {biz.name}
              </a>,
              <span className="text-zinc-400 font-mono text-xs">{biz.slug}</span>,
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${biz.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {biz.active ? 'Active' : 'Inactive'}
              </span>,
              biz.subscription_ends_at ? new Date(biz.subscription_ends_at).toLocaleDateString() : 'N/A',
              <div className="flex flex-wrap gap-1">
                <ActionButton
                  onClick={() => handleBusinessAction(biz.slug, 'toggle_active')}
                  label={biz.active ? 'Deactivate' : 'Activate'}
                  color={biz.active ? 'red' : 'green'}
                  disabled={actionLoading[biz.slug]}
                />
                <ActionButton onClick={() => handleBusinessAction(biz.slug, 'extend')} label="+30 Days" color="blue" disabled={actionLoading[biz.slug]} />
                <ActionButton
                  onClick={() => {
                    const days = prompt('Enter number of days to extend:', '30');
                    if (days && !isNaN(days) && days > 0) handleBusinessAction(biz.slug, 'extend_custom', { days: parseInt(days) });
                  }}
                  label="Custom"
                  color="indigo"
                />
                <ActionButton
                  onClick={() => {
                    const endDate = prompt('Enter new end date (YYYY-MM-DD):');
                    if (endDate) {
                      const date = new Date(endDate);
                      if (!isNaN(date.getTime())) handleBusinessAction(biz.slug, 'override_end_date', { endDate: date.toISOString() });
                      else alert('Invalid date format. Use YYYY-MM-DD.');
                    }
                  }}
                  label="Set Date"
                  color="pink"
                />
                <ActionButton onClick={() => handleEditBusiness(biz)} label="Edit" color="purple" />
              </div>,
            ],
          }))}
        />
      )}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}