// src/components/admin/BusinessesTab.jsx
import { useState, useEffect } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import ActionButton from './ActionButton';
import ExportButton from './ExportButton';

export default function BusinessesTab({
  businesses,
  loading,
  search,
  setSearch,
  businessFilter,
  setBusinessFilter,
  businessTypeFilter,
  setBusinessTypeFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  page,
  setPage,
  totalPages,
  selectedSlugs,
  setSelectedSlugs,
  handleBusinessAction,
  handleBulkAction,
  handleEditBusiness,
  handleDomainAction,
  handleToggleAds,
  actionLoading,
  exportCSV,
}) {
  const [selectAll, setSelectAll] = useState(false);

  // Keep "select all" checkbox in sync when the user manually
  // deselects rows or when the page changes.
  useEffect(() => {
    if (businesses.length === 0) {
      setSelectAll(false);
      return;
    }
    const allSelected = businesses.every((b) =>
      selectedSlugs.includes(b.slug)
    );
    setSelectAll(allSelected);
  }, [businesses, selectedSlugs]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSlugs([]);
    } else {
      setSelectedSlugs(businesses.map((b) => b.slug));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (slug) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // 👇 FIXED: These values now match the ACTUAL strings stored in the
  // `business_type` column (see useSignup.js ALL_BUSINESS_TYPES and
  // save-business.cjs getFeaturesForType). The previous list used
  // "Skin Care", "Restaurant", "Auto" — none of which match what's saved,
  // so those filters always returned empty results.
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Lash Artist', label: 'Lash Artist' },
    { value: 'Hair Stylist', label: 'Hair Stylist' },
    { value: 'Makeup Artist', label: 'Makeup Artist' },
    { value: 'Nail Technician', label: 'Nail Technician' },
    { value: 'Skin Care / Facialist', label: 'Skin Care / Facialist' },
    { value: 'Fashion / Boutique', label: 'Fashion / Boutique' },
    { value: 'Restaurant / Food', label: 'Restaurant / Food' },
    { value: 'Auto Dealer / Rental', label: 'Auto Dealer / Rental' },
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    });
  };

  return (
    <div className="space-y-4">
      {/* ─── Filters ─── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, slug or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
        />
        <Select
          value={businessFilter}
          onChange={setBusinessFilter}
          options={filterOptions}
        />
        <Select
          value={businessTypeFilter}
          onChange={setBusinessTypeFilter}
          options={typeOptions}
        />
        <Select
          value={subscriptionFilter}
          onChange={setSubscriptionFilter}
          options={subFilterOptions}
        />
        <ExportButton onClick={() => exportCSV(businesses, 'businesses.csv')} />
      </div>

      {/* ─── Bulk Actions ─── */}
      {selectedSlugs.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">
          <span className="text-sm text-zinc-300 font-medium">
            {selectedSlugs.length} selected
          </span>
          <ActionButton
            onClick={() => handleBulkAction('activate')}
            label="Activate"
            color="green"
          />
          <ActionButton
            onClick={() => handleBulkAction('deactivate')}
            label="Deactivate"
            color="red"
          />
          <ActionButton
            onClick={() => handleBulkAction('extend')}
            label="Extend 30 Days"
            color="blue"
          />
          <button
            onClick={() => setSelectedSlugs([])}
            className="text-xs text-zinc-400 hover:text-white ml-auto transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ─── Table ─── */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400">Loading...</div>
      ) : businesses.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 border border-zinc-800 rounded-xl">
          No businesses found.
        </div>
      ) : (
        <Table
          headers={[
            // 👇 Header checkbox now controls select-all. Was a dead
            // `toggleSelectAll` function before — this wires it up.
            <input
              key="select-all"
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600 cursor-pointer"
              title="Select all on this page"
            />,
            'Business',
            'Slug',
            'Domain',
            'Domain Status',
            'Ads',      // 👈 NEW column
            'Status',
            'Expires',
            'Actions',
          ]}
          rows={businesses.map((biz) => ({
            // Row dims if the business is inactive — quick visual signal
            className: biz.active ? '' : 'opacity-60',
            cells: [
              // ── Checkbox ──
              <input
                type="checkbox"
                checked={selectedSlugs.includes(biz.slug)}
                onChange={() => toggleSelect(biz.slug)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-600 cursor-pointer"
              />,

              // ── Business Name (link + external icon) ──
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={`/${biz.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-400 transition-colors truncate"
                  title={biz.name}
                >
                  {biz.name}
                </a>
                <a
                  href={`/${biz.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                  title="Open public page in new tab"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>,

              // ── Slug (with copy button) ──
              <span className="text-zinc-400 font-mono text-xs flex items-center gap-1">
                {biz.slug}
                <button
                  onClick={() => copyToClipboard(biz.slug)}
                  className="text-zinc-600 hover:text-white transition-colors flex-shrink-0"
                  title="Copy slug"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </span>,

              // ── Custom Domain ──
              <span className="text-xs font-mono text-zinc-300 flex items-center gap-1">
                {biz.custom_domain || '—'}
                {biz.custom_domain && (
                  <button
                    onClick={() => copyToClipboard(biz.custom_domain)}
                    className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                    title="Copy domain"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </span>,

              // ── Domain Status ──
              <span>
                {biz.custom_domain_status && biz.custom_domain_status !== 'none' ? (
                  <span className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        biz.custom_domain_status === 'verified'
                          ? 'bg-green-500/20 text-green-400'
                          : biz.custom_domain_status === 'approved'
                          ? 'bg-blue-500/20 text-blue-400'
                          : biz.custom_domain_status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : biz.custom_domain_status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-zinc-600 text-zinc-300'
                      }`}
                    >
                      {biz.custom_domain_status}
                    </span>
                    {biz.custom_domain_notes && (
                      <span
                        className="text-zinc-400 cursor-help"
                        title={biz.custom_domain_notes}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-500">—</span>
                )}
              </span>,

              // ── Ads Status (NEW) ──
              // 👈 Shows whether ads are enabled. Critical for AdSense
              // policy management: if a business posts content that
              // violates AdSense policy, you can disable ads on that ONE
              // business instead of risking your entire AdSense account.
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  biz.ads_enabled === false
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
                title={
                  biz.ads_enabled === false
                    ? 'Ads are disabled for this business'
                    : 'Ads are running on this business\'s public page'
                }
              >
                {biz.ads_enabled === false ? 'Off' : 'On'}
              </span>,

              // ── Active Status ──
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  biz.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {biz.active ? 'Active' : 'Inactive'}
              </span>,

              // ── Expiration ──
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                {biz.subscription_ends_at
                  ? new Date(biz.subscription_ends_at).toLocaleDateString()
                  : 'N/A'}
              </span>,

              // ── Actions ──
              <div className="flex flex-wrap gap-1">
                <ActionButton
                  onClick={() => handleBusinessAction(biz.slug, 'toggle_active')}
                  label={biz.active ? 'Deactivate' : 'Activate'}
                  color={biz.active ? 'red' : 'green'}
                  disabled={actionLoading[biz.slug]}
                  title={biz.active ? 'Hide this business from the public' : 'Make this business visible again'}
                />
                <ActionButton
                  onClick={() => handleBusinessAction(biz.slug, 'extend')}
                  label="+30 Days"
                  color="blue"
                  disabled={actionLoading[biz.slug]}
                  title="Add 30 days to subscription"
                />
                <ActionButton
                  onClick={() => {
                    const days = prompt('Enter number of days to extend:', '30');
                    if (days && !isNaN(days) && days > 0)
                      handleBusinessAction(biz.slug, 'extend_custom', {
                        days: parseInt(days),
                      });
                  }}
                  label="Custom"
                  color="indigo"
                  title="Add a custom number of days"
                />
                <ActionButton
                  onClick={() => {
                    const endDate = prompt('Enter new end date (YYYY-MM-DD):');
                    if (endDate) {
                      const date = new Date(endDate);
                      if (!isNaN(date.getTime()))
                        handleBusinessAction(biz.slug, 'override_end_date', {
                          endDate: date.toISOString(),
                        });
                      else alert('Invalid date format. Use YYYY-MM-DD.');
                    }
                  }}
                  label="Set Date"
                  color="pink"
                  title="Override the subscription end date"
                />
                <ActionButton
                  onClick={() => handleEditBusiness(biz)}
                  label="Edit"
                  color="purple"
                  title="Edit business profile fields"
                />
                <ActionButton
                  onClick={() => handleDomainAction(biz)}
                  label="Domain"
                  color="indigo"
                  disabled={actionLoading['domain-' + biz.slug]}
                  title="Approve, reject, or verify the custom domain request"
                />

                {/* 👈 NEW: Ads toggle. Only render if the parent passed
                    the handler — keeps this file backwards compatible
                    with older versions of useAdminState. */}
                {typeof handleToggleAds === 'function' && (
                  <ActionButton
                    onClick={() => handleToggleAds(biz)}
                    label={biz.ads_enabled === false ? 'Enable Ads' : 'Disable Ads'}
                    color={biz.ads_enabled === false ? 'blue' : 'yellow'}
                    disabled={actionLoading['ads-' + biz.slug]}
                    title={
                      biz.ads_enabled === false
                        ? 'Turn ads back on for this business'
                        : 'Turn off ads for this business (useful if content violates AdSense policy)'
                    }
                  />
                )}
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
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}