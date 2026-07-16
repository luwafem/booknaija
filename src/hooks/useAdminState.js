import { useState, useEffect, useCallback } from 'react';
import { useAdminApi } from './useAdminApi';

export function useAdminState() {
  const { safeFetch } = useAdminApi();

  // ─── Tabs ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Data ────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [revenue, setRevenue] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [failedPayouts, setFailedPayouts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({});
  const [health, setHealth] = useState(null);
  const [reportResult, setReportResult] = useState(null);

  // ─── Filter / Pagination ─────────────────────────────────
  const [businessFilter, setBusinessFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [logLevel, setLogLevel] = useState('all');

  // ─── Affiliates ──────────────────────────────────────────
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [affiliateReferrals, setAffiliateReferrals] = useState([]);
  const [manualPayoutAffiliate, setManualPayoutAffiliate] = useState('');
  const [manualPayoutAmount, setManualPayoutAmount] = useState('');
  const [manualPayoutReason, setManualPayoutReason] = useState('');
  const [commissionOverride, setCommissionOverride] = useState({});

  // ─── Manual Payment ──────────────────────────────────────
  const [manualSlug, setManualSlug] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // ─── Reports ─────────────────────────────────────────────
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportMetrics, setReportMetrics] = useState([]);

  // ─── Action Loading ──────────────────────────────────────
  const [actionLoading, setActionLoading] = useState({});

  // ─── Edit Business Modal ────────────────────────────────
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  // ─── Data Fetchers (memoized, stable) ──────────────────
  const fetchStats = useCallback(async () => {
    try { setStats(await safeFetch('/.netlify/functions/admin-stats')); } catch {}
  }, [safeFetch]);

  const fetchRevenue = useCallback(async () => {
    try { setRevenue(await safeFetch('/.netlify/functions/admin-revenue')); } catch {}
  }, [safeFetch]);

  const fetchGrowth = useCallback(async () => {
    try { setGrowthData(await safeFetch('/.netlify/functions/admin-growth')); } catch {}
  }, [safeFetch]);

  const fetchGeo = useCallback(async () => {
    try { setGeoData(await safeFetch('/.netlify/functions/admin-geo')); } catch {}
  }, [safeFetch]);

  const fetchChurn = useCallback(async () => {
    try { setChurnData(await safeFetch('/.netlify/functions/admin-churn')); } catch {}
  }, [safeFetch]);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/.netlify/functions/admin-businesses?page=${page}&limit=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (businessFilter === 'active') url += '&active=true';
      else if (businessFilter === 'inactive') url += '&active=false';
      if (businessTypeFilter) url += `&businessType=${encodeURIComponent(businessTypeFilter)}`;
      const data = await safeFetch(url);
      let filtered = data.businesses || [];
      // subscription filter
      const now = new Date();
      if (subscriptionFilter === 'expiring') {
        const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b =>
          b.subscription_ends_at &&
          new Date(b.subscription_ends_at) > now &&
          new Date(b.subscription_ends_at) <= fiveDaysLater
        );
      } else if (subscriptionFilter === 'expired') {
        filtered = filtered.filter(b =>
          !b.subscription_ends_at || new Date(b.subscription_ends_at) < now
        );
      } else if (subscriptionFilter === 'active') {
        filtered = filtered.filter(b =>
          b.subscription_ends_at && new Date(b.subscription_ends_at) > now && b.active
        );
      }
      setBusinesses(filtered);
      setTotalPages(data.totalPages || 1);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }, [page, search, businessFilter, businessTypeFilter, subscriptionFilter, safeFetch]);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/.netlify/functions/admin-affiliates?page=${page}&limit=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const data = await safeFetch(url);
      setAffiliates(data.affiliates || []);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, search, safeFetch]);

  const fetchFailedPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeFetch(`/.netlify/functions/admin-failed-payouts?page=${page}&limit=20`);
      setFailedPayouts(data.payouts || []);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, safeFetch]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/.netlify/functions/admin-logs?page=${page}&limit=50`;
      if (logLevel !== 'all') url += `&level=${logLevel}`;
      const data = await safeFetch(url);
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, logLevel, safeFetch]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeFetch(`/.netlify/functions/admin-webhooks?page=${page}&limit=20`);
      setTransactions(data.webhooks || []);
      setTotalPages(data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, safeFetch]);

  const fetchSettings = useCallback(async () => {
    try { setSettings(await safeFetch('/.netlify/functions/admin-settings')); } catch {}
  }, [safeFetch]);

  const fetchHealth = useCallback(async () => {
    try { setHealth(await safeFetch('/.netlify/functions/admin-health')); } catch {}
  }, [safeFetch]);

  const fetchAffiliateReferrals = useCallback(async (affiliateId) => {
    try {
      setAffiliateReferrals((await safeFetch(`/.netlify/functions/admin-affiliate-referrals?affiliateId=${affiliateId}`)).referrals || []);
    } catch { setAffiliateReferrals([]); }
  }, [safeFetch]);

  // ─── Unified Data Loader ────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            fetchStats(),
            fetchRevenue(),
            fetchGrowth(),
            fetchGeo(),
            fetchChurn(),
            fetchLogs(),
          ]);
          break;
        case 'revenue':
          await Promise.all([fetchRevenue(), fetchChurn()]);
          break;
        case 'growth':
          await fetchGrowth();
          break;
        case 'geo':
          await fetchGeo();
          break;
        case 'businesses':
          await fetchBusinesses();
          break;
        case 'affiliates':
          await fetchAffiliates();
          break;
        case 'payouts':
          await fetchFailedPayouts();
          break;
        case 'logs':
          await fetchLogs();
          break;
        case 'transactions':
          await fetchTransactions();
          break;
        case 'settings':
          await fetchSettings();
          break;
        case 'system':
          await Promise.all([fetchHealth(), fetchLogs()]);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    fetchStats, fetchRevenue, fetchGrowth, fetchGeo, fetchChurn,
    fetchBusinesses, fetchAffiliates, fetchFailedPayouts, fetchLogs,
    fetchTransactions, fetchSettings, fetchHealth,
  ]);

  // ─── Effect ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const doLoad = async () => {
      // loadData already handles its own loading state, but we could add abort support
      await loadData();
    };

    doLoad();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [loadData]); // Only runs when loadData changes (i.e., activeTab or filter dependencies)

  // ─── Actions ─────────────────────────────────────────────
  const handleBusinessAction = async (slug, action, extra = {}) => {
    if (!confirm(`Are you sure you want to ${action} for ${slug}?`)) return;
    setActionLoading(prev => ({ ...prev, [slug]: true }));
    try {
      await safeFetch('/.netlify/functions/admin-businesses', {
        method: 'POST',
        body: JSON.stringify({ slug, action, ...extra }),
      });
      await fetchBusinesses();
      await fetchStats();
    } catch {}
    setActionLoading(prev => ({ ...prev, [slug]: false }));
  };

  const handleBulkAction = async (action) => {
    if (!selectedSlugs.length) return;
    if (!confirm(`Apply "${action}" to ${selectedSlugs.length} businesses?`)) return;
    try {
      await safeFetch('/.netlify/functions/admin-businesses-bulk', {
        method: 'POST',
        body: JSON.stringify({ slugs: selectedSlugs, action }),
      });
      await fetchBusinesses();
      setSelectedSlugs([]);
      alert(`Bulk action "${action}" completed.`);
    } catch {}
  };

  const handleRetryPayout = async (payoutId) => {
    if (!confirm('Retry this payout?')) return;
    const key = 'payout-' + payoutId;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await safeFetch('/.netlify/functions/admin-retry-payout', {
        method: 'POST',
        body: JSON.stringify({ payoutId }),
      });
      alert('Payout retried successfully!');
      await fetchFailedPayouts();
      await fetchStats();
    } catch {}
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleEditBusiness = (biz) => {
    setSelectedBusiness(biz);
    setEditForm({
      name: biz.name,
      email: biz.email,
      phone: biz.phone,
      location: biz.location,
      tagline: biz.tagline,
      bio: biz.bio,
      business_type: biz.business_type || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBusiness) return;
    const key = 'edit-' + selectedBusiness.slug;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await safeFetch('/.netlify/functions/admin-businesses', {
        method: 'POST',
        body: JSON.stringify({
          slug: selectedBusiness.slug,
          action: 'update',
          data: editForm,
        }),
      });
      setShowEditModal(false);
      await fetchBusinesses();
      await fetchStats();
      alert('Business updated successfully!');
    } catch {}
    setActionLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!manualSlug || !manualAmount || manualAmount <= 0) {
      alert('Please enter a valid business slug and amount.');
      return;
    }
    setManualLoading(true);
    try {
      const data = await safeFetch('/.netlify/functions/admin-manual-payment', {
        method: 'POST',
        body: JSON.stringify({
          businessSlug: manualSlug,
          amount: parseInt(manualAmount),
          note: manualNote,
        }),
      });
      alert(`Payment recorded and subscription extended to ${new Date(data.new_end_date).toLocaleDateString()}`);
      setManualSlug(''); setManualAmount(''); setManualNote('');
      await fetchTransactions();
      await fetchRevenue();
      await fetchStats();
    } catch {}
    setManualLoading(false);
  };

  const toggleSetting = async (key, value) => {
    try {
      await safeFetch('/.netlify/functions/admin-settings', {
        method: 'POST',
        body: JSON.stringify({ key, value }),
      });
      await fetchSettings();
    } catch {}
  };

  const generateReport = async () => {
    try {
      const data = await safeFetch('/.netlify/functions/admin-report', {
        method: 'POST',
        body: JSON.stringify({
          startDate: reportStart,
          endDate: reportEnd,
          metrics: reportMetrics.length ? reportMetrics : ['businesses', 'revenue', 'affiliates'],
        }),
      });
      setReportResult(data);
    } catch {}
  };

  const handleManualPayout = async () => {
    if (!manualPayoutAffiliate || !manualPayoutAmount || manualPayoutAmount <= 0) {
      alert('Please enter affiliate ID and valid amount.');
      return;
    }
    setActionLoading(prev => ({ ...prev, ['manualPayout']: true }));
    try {
      await safeFetch('/.netlify/functions/admin-manual-payout', {
        method: 'POST',
        body: JSON.stringify({
          affiliateId: manualPayoutAffiliate,
          amount: parseInt(manualPayoutAmount),
          reason: manualPayoutReason || 'Manual admin payout',
        }),
      });
      alert('Payout sent successfully!');
      setManualPayoutAffiliate(''); setManualPayoutAmount(''); setManualPayoutReason('');
      await fetchAffiliates();
    } catch {}
    setActionLoading(prev => ({ ...prev, ['manualPayout']: false }));
  };

  const handleCommissionOverride = async (affiliateId) => {
    const rate = prompt('Enter new commission rate (0-100):', commissionOverride[affiliateId] || '');
    if (rate === null) return;
    const numRate = parseInt(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      alert('Please enter a valid number between 0 and 100.');
      return;
    }
    try {
      await safeFetch('/.netlify/functions/admin-affiliate-commission', {
        method: 'POST',
        body: JSON.stringify({ affiliateId, commissionRate: numRate }),
      });
      setCommissionOverride(prev => ({ ...prev, [affiliateId]: numRate }));
      await fetchAffiliates();
      alert('Commission rate updated!');
    } catch {}
  };

  const handleRefund = async (reference) => {
    if (!confirm(`Refund transaction ${reference}?`)) return;
    const amount = prompt('Enter amount to refund (leave blank for full):');
    try {
      await safeFetch('/.netlify/functions/admin-refund', {
        method: 'POST',
        body: JSON.stringify({
          transactionReference: reference,
          amount: amount ? parseInt(amount) : undefined,
          reason: 'Admin refund',
        }),
      });
      alert('Refund processed!');
      await fetchTransactions();
    } catch {}
  };

  // ─── Return ──────────────────────────────────────────────
  return {
    // state
    activeTab, setActiveTab,
    loading, error,
    stats, revenue, growthData, geoData, churnData,
    businesses, affiliates, failedPayouts, logs, transactions, settings, health,
    businessFilter, setBusinessFilter,
    businessTypeFilter, setBusinessTypeFilter,
    subscriptionFilter, setSubscriptionFilter,
    search, setSearch,
    page, setPage,
    totalPages,
    selectedSlugs, setSelectedSlugs,
    logLevel, setLogLevel,
    showReferralModal, setShowReferralModal,
    selectedAffiliate, setSelectedAffiliate,
    affiliateReferrals,
    manualPayoutAffiliate, setManualPayoutAffiliate,
    manualPayoutAmount, setManualPayoutAmount,
    manualPayoutReason, setManualPayoutReason,
    commissionOverride,
    manualSlug, setManualSlug,
    manualAmount, setManualAmount,
    manualNote, setManualNote,
    manualLoading,
    reportStart, setReportStart,
    reportEnd, setReportEnd,
    reportMetrics, setReportMetrics,
    reportResult,
    actionLoading,
    selectedBusiness,
    showEditModal, setShowEditModal,
    editForm, setEditForm,
    // actions (most are already exposed; you may want to expose loadData for manual refresh)
    fetchStats, fetchRevenue, fetchGrowth, fetchGeo, fetchChurn,
    fetchBusinesses, fetchAffiliates, fetchFailedPayouts, fetchLogs, fetchTransactions,
    fetchSettings, fetchHealth, fetchAffiliateReferrals,
    handleBusinessAction, handleBulkAction, handleRetryPayout,
    handleEditBusiness, handleSaveEdit,
    handleManualPayment, toggleSetting, generateReport,
    handleManualPayout, handleCommissionOverride, handleRefund,
    // optional: expose loadData for manual refresh
    loadData,
  };
}